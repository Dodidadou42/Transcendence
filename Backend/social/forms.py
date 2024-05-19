from django import forms

class searchUserForm(forms.Form):
    filter = forms.CharField(max_length=15)
    user_input = forms.CharField(max_length=100, required=False)

class userOnlyForm(forms.Form):
    user = forms.CharField(max_length=255)

class postPicForm(forms.Form):
    newPic = forms.CharField()

class postInfosForm(forms.Form):
    newPseudo = forms.CharField(max_length=15, min_length=4)
    newDesc = forms.CharField(max_length=200)

class toggleA2fForm(forms.Form):
    code = forms.CharField(max_length=6)

class createGroupForm(forms.Form):
    members = forms.JSONField(decoder="array")
    groupName = forms.CharField(max_length=50)
    picture = forms.CharField()

class getGroupChatForm(forms.Form):
    group = forms.CharField(max_length=200)

class addUserGroupForm(forms.Form):
    user_added_id = forms.CharField(max_length=15)
    groupId = forms.CharField(max_length=200)

class remUserGroupForm(forms.Form):
    user_remove_id = forms.CharField(max_length=15)
    groupId = forms.CharField(max_length=200)

class sendUserHistForm(forms.Form):
    user_id_to_check = forms.CharField(max_length=15)
    nb_history_request = forms.IntegerField()
    i_begin_history = forms.IntegerField()

class gameHistoryForm(forms.Form):
    game_id = forms.CharField(max_length=200)