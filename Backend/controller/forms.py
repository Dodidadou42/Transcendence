from django import forms

class UserCreationForm(forms.Form):
    user_id = forms.CharField(max_length=15)
    email = forms.EmailField(max_length=255)
    password = forms.CharField(max_length=255)

class UserConnectionForm(forms.Form):
    email = forms.EmailField(max_length=255)
    password = forms.CharField(max_length=255)
    week = forms.BooleanField(required=False)

class User42InfoForm(forms.Form):
    login = forms.CharField(max_length=50)
    email = forms.EmailField(max_length=255)

class ForgotPasswordForm(forms.Form):
    email = forms.EmailField(max_length=255)

class RecoverCodeForm(forms.Form):
    email = forms.EmailField(max_length=255)
    recovery_code = forms.CharField(max_length=10)

class ChangePasswordForm(forms.Form):
    email = forms.EmailField(max_length=255)
    password = forms.CharField(max_length=255)
    recovery_code = forms.CharField(max_length=10)

class EditPasswordForm(forms.Form):
    password = forms.CharField(max_length=255)
    new_password = forms.CharField(max_length=255)

class BPassa2fForm(forms.Form):
    email = forms.EmailField(max_length=255)
    password = forms.CharField(max_length=255)

class IsConnectCodeForm(forms.Form):
    email = forms.EmailField(max_length=255)
    password = forms.CharField(max_length=255)
    connection_code = forms.CharField(max_length=50)
    desactivate_a2f = forms.BooleanField(required=False)
    weekly = forms.BooleanField(required=False)

class sign42Form(forms.Form):
    code = forms.CharField()

class SocketRecipientForm(forms.Form):
    recipient = forms.CharField(max_length=15)

class SocketNewModeForm(forms.Form):
    newMode = forms.CharField(max_length=4)
    
class SocketNewModeTournamentForm(forms.Form):
    mode = forms.CharField(max_length=4)

class socketAddBotForm(forms.Form):
    pos = forms.IntegerField()
    dif = forms.CharField(max_length=15)

class SocketInvitePlayerForm(forms.Form):
    pos = forms.IntegerField()
    userInvited = forms.CharField(max_length=15)

class SocketAddPlayerForm(forms.Form):
    pos = forms.IntegerField()
    senderInv = forms.CharField(max_length=15)

class SocketKickFromGroupForm(forms.Form):
    pos = forms.IntegerField(min_value=1)

class SocketMessageForm(forms.Form):
    message = forms.CharField(max_length=1023)
    recipient = forms.CharField(max_length=15)
    
class SocketGroupMessageForm(forms.Form):
    message = forms.CharField(max_length=1023)
    recipient = forms.CharField(max_length=50)

class SocketGameInviteForm(forms.Form):
    recipient = forms.CharField(max_length=15)
    mode = forms.CharField(max_length=4)

class SocketEditGroupNameForm(forms.Form):
    newName = forms.CharField(max_length=50)
    recipient = forms.CharField(max_length=50)

class SocketEditPictureForm(forms.Form):
    newPic = forms.CharField(max_length=1000000000) 
    recipient = forms.CharField(max_length=50)

class SocketUserGroupForm(forms.Form):
    recipient = forms.CharField(max_length=50)
    user = forms.CharField(max_length=15)
    
class SocketUserGroupRemovedForm(forms.Form):
    recipient = forms.CharField(max_length=50)
    userRemoved = forms.CharField(max_length=15)
    
class SocketUserGroupAddedForm(forms.Form):
    recipient = forms.CharField(max_length=50)
    user_added = forms.CharField(max_length=15)
    
class EventTypeForm(forms.Form):
    event_type = forms.CharField(max_length=255)
    
class GamePanelForm(forms.Form):
    action = forms.CharField(max_length=255)

class SocketGroupNameForm(forms.Form):
    recipient = forms.CharField(max_length=50)
