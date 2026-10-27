from django import forms
from django.conf import settings
from django.utils.translation import get_language

from files.methods import is_mediacms_manager
from files.frontend_translations import translate_string

from .models import Channel, User


class SignupForm(forms.Form):
    name = forms.CharField(max_length=100, label="Name")

    def signup(self, request, user):
        user.name = self.cleaned_data["name"]
        user.save()


class UserForm(forms.ModelForm):
    class Meta:
        model = User
        fields = (
            "name",
            "description",
            "logo",
            "notification_on_comments",
            "is_featured",
            "advancedUser",
            "is_manager",
            "is_editor",
            "is_approved",
            # "allow_contact",
        )

    def clean_logo(self):
        image = self.cleaned_data.get("logo", False)
        if image:
            if image.size > 2 * 1024 * 1024:
                raise forms.ValidationError("Image file too large ( > 2mb )")
            return image
        else:
            raise forms.ValidationError("Please provide a logo")

    def __init__(self, user, *args, **kwargs):
        super(UserForm, self).__init__(*args, **kwargs)
        self.fields.pop("is_featured")
        if not is_mediacms_manager(user):
            self.fields.pop("advancedUser")
            self.fields.pop("is_manager")
            self.fields.pop("is_editor")

        if not settings.USERS_NEEDS_TO_BE_APPROVED or not is_mediacms_manager(user):
            if "is_approved" in self.fields:
                self.fields.pop("is_approved")

        labels = {
            "name": "Full name",
            "description": "About me",
            "logo": "Logo",
            "notification_on_comments": "Whether you will receive email notifications for comments added to your content",
            "advancedUser": "Advanced user",
            "is_manager": "MediaCMS Manager",
            "is_editor": "MediaCMS Editor",
        }
        language_code = get_language() or "en"
        if language_code.lower().startswith("zh"):
            self.label_suffix = "："
        for field_name, label in labels.items():
            if field_name in self.fields:
                self.fields[field_name].label = translate_string(language_code, label)

        if user.socialaccount_set.exists():
            # for Social Accounts do not allow to edit the name
            self.fields["name"].widget.attrs['readonly'] = True


class ChannelForm(forms.ModelForm):
    class Meta:
        model = Channel
        fields = ("banner_logo",)

    def clean_banner_logo(self):
        image = self.cleaned_data.get("banner_logo", False)
        if image:
            if image.size > 2 * 1024 * 1024:
                raise forms.ValidationError("Image file too large ( > 2mb )")
            return image
        else:
            raise forms.ValidationError("Please provide a banner")
