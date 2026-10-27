# -*- coding: utf-8 -*-
import os
import shutil

from django.conf import settings
from django.core.exceptions import PermissionDenied
from django.core.files import File
from django.http import JsonResponse
from django.utils import timezone
from django.views import generic

from actions.models import MediaAction
from files.helpers import get_alphanumeric_and_spaces, rm_file
from files.methods import user_allowed_to_upload
from files.models import Media, Tag

from .fineuploader import ChunkedFineUploader
from .forms import FineUploaderUploadForm, FineUploaderUploadSuccessForm


class FineUploaderView(generic.FormView):
    http_method_names = ("post",)
    form_class_upload = FineUploaderUploadForm
    form_class_upload_success = FineUploaderUploadSuccessForm

    @property
    def concurrent(self):
        return settings.CONCURRENT_UPLOADS

    @property
    def chunks_done(self):
        return self.chunks_done_param_name in self.request.GET

    @property
    def chunks_done_param_name(self):
        return settings.CHUNKS_DONE_PARAM_NAME

    def make_response(self, data, **kwargs):
        return JsonResponse(data, **kwargs)

    def get_form(self, form_class=None):
        if self.chunks_done:
            form_class = self.form_class_upload_success
        else:
            form_class = self.form_class_upload
        return form_class(**self.get_form_kwargs())

    def dispatch(self, request, *args, **kwargs):
        if not user_allowed_to_upload(request):
            raise PermissionDenied  # HTTP 403
        return super(FineUploaderView, self).dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        self.upload = ChunkedFineUploader(form.cleaned_data, self.concurrent)
        if self.upload.concurrent and self.chunks_done:
            try:
                self.upload.combine_chunks()
            except FileNotFoundError:
                data = {"success": False, "error": "Error with File Uploading"}
                return self.make_response(data, status=400)
        elif self.upload.total_parts == 1:
            self.upload.save()
        else:
            self.upload.save()
            return self.make_response({"success": True})

        media_file = os.path.join(settings.MEDIA_ROOT, self.upload.real_path)
        metadata = form.cleaned_data
        media_kwargs = {
            "media_file": None,
            "user": self.request.user,
        }
        if metadata.get("has_media_metadata"):
            media_kwargs.update({
                "title": (metadata.get("title") or "").strip() or self.upload.original_filename,
                "description": metadata.get("description") or "",
                "enable_comments": metadata.get("enable_comments", False),
                "add_date": metadata.get("add_date") or timezone.now(),
            })
            if metadata.get("thumbnail_time") is not None:
                media_kwargs["thumbnail_time"] = metadata["thumbnail_time"]
        else:
            media_kwargs["title"] = self.upload.original_filename

        with open(media_file, "rb") as f:
            media_kwargs["media_file"] = File(f)
            new = Media.objects.create(**media_kwargs)

        if metadata.get("has_media_metadata") and metadata.get("new_tags"):
            for raw_tag in metadata["new_tags"].split(","):
                tag_title = get_alphanumeric_and_spaces(raw_tag.strip())[:100]
                if not tag_title:
                    continue
                tag, _ = Tag.objects.get_or_create(title=tag_title, defaults={"user": self.request.user})
                new.tags.add(tag)
        MediaAction.objects.create(user=self.request.user, media=new, action="watch")

        rm_file(media_file)
        shutil.rmtree(os.path.join(settings.MEDIA_ROOT, self.upload.file_path))
        return self.make_response({
            "success": True,
            "media_url": new.get_absolute_url(),
            "edit_url": new.edit_url,
            "title": new.title,
            "friendly_token": new.friendly_token,
        })

    def form_invalid(self, form):
        data = {"success": False, "error": "%s" % repr(form.errors)}
        return self.make_response(data, status=400)
