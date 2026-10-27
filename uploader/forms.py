from django import forms


class UploadMetadataForm(forms.Form):
    """Optional source details sent with the completed upload request."""

    has_media_metadata = forms.BooleanField(required=False)
    title = forms.CharField(required=False, max_length=100)
    new_tags = forms.CharField(required=False)
    add_date = forms.DateTimeField(
        required=False,
        input_formats=("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M"),
    )
    description = forms.CharField(required=False)
    enable_comments = forms.BooleanField(required=False)
    thumbnail_time = forms.DecimalField(required=False, min_value=0, max_digits=8, decimal_places=1)


class FineUploaderUploadForm(UploadMetadataForm):
    qqfile = forms.FileField()
    qquuid = forms.CharField()
    qqfilename = forms.CharField()
    qqpartindex = forms.IntegerField(required=False)
    qqchunksize = forms.IntegerField(required=False)
    qqtotalparts = forms.IntegerField(required=False)
    qqtotalfilesize = forms.IntegerField(required=False)
    qqpartbyteoffset = forms.IntegerField(required=False)


class FineUploaderUploadSuccessForm(UploadMetadataForm):
    qquuid = forms.CharField()
    qqfilename = forms.CharField()
    qqtotalparts = forms.IntegerField()
    qqtotalfilesize = forms.IntegerField(required=False)
