<template>
  <div>
    <h4 class="page-title">My Account
    </h4>

    <b-row>
      <b-col lg='6' xs='12'  offset="3">
        <Widget
          title="<h2> </h2>" customHeader  >
          <h2>  <i class="la la-user" />&nbsp;<strong>{{userAccount.id}}</strong> </h2>
          <b-form @submit="onSubmit">
            <fieldset>
              <legend/>
                <b-form-group
                horizontal
                label="Name"
                :label-cols="3"
                label-breakpoint="md"
                label-for="name"
              >
                <input
                  v-validate="{ max:30 }"
                  name="name"
                  :class="{ 'form-control': true,  max:30, 'is-invalid': errors.has('name')}"
                  type="text"
                  id="name"
                  v-model="userAccount.name"
                  maxlength="31"
                />
                <span class="text-danger" v-if="errors.has('name')">
                  {{ errors.first('name') }}
                </span>
              </b-form-group>
              <b-form-group
                horizontal
                label="E-mail"
                :label-cols="3"
                label-breakpoint="md"
                label-for="email"
              >
                <input
                  v-validate="{ required: true, max:50,  email: true }"
                  name="email"
                  :class="{ 'form-control': true, 'is-invalid': errors.has('email')}"
                  type="text"
                  id="email"
                  v-model="userAccount.email"
                  placeholder="email@email.com"
                  data-vv-as="E-mail"
                  maxlength="51"
                />
                <span class="text-warning" v-if="errors.has('email')">
                  {{ errors.first('email') }}
                </span>
              </b-form-group>
              <b-form-group
                horizontal
                label="Phone"
                :label-cols="3"
                label-breakpoint="md"
                label-for="phone"
              >
                <input
                  name="phone"
                  :class="{ 'form-control': true }"
                  type="text"
                  id="phone"
                  placeholder="__-_____-_____"
                  v-mask="'## ##### #####'"
                  v-model="userAccount.phone"
                  data-vv-as="Phone"
                />
              </b-form-group>
              <legend/>
              <b-form-group
                horizontal
                label="Current Password"
                :label-cols="3"
                label-breakpoint="md"
                label-for="current_Password"
              >
                <input
                  v-validate.initial="{ required: this.isRequired, min:8, max:20 }"
                  name="current_Password"
                  :class="{ 'form-control': true, 'is-invalid': errors.has('current_Password')}"
                  type="password"
                  id="current_Password"
                  ref="current_Password"
                  v-model="currentPassword"
                  data-vv-as="Current Password"
                  maxlength="21"
                />
                <span class="text-warning" v-if="errors.has('current_Password')">
                  {{ errors.first('current_Password') }}
                </span>
              </b-form-group>
              <b-form-group
                horizontal
                label="New Password"
                :label-cols="3"
                label-breakpoint="md"
                label-for="new_Password"
                description="Password must contain at least 8 characters, including letters, special characters, numbers."
              >
                <input
                  v-validate.initial="{ required: this.isRequired, min:8, max:20,regex: /(?=.{8,})((?=.*\d)(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)(?=.*[a-zA-Z])(?=.*[\W_])|(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])).*/  }"
                  name="new_Password"
                  :class="{ 'form-control': true, 'is-invalid': errors.has('new_Password')}"
                  type="password"
                  id="new_Password"
                  ref="new_Password"
                  v-model="newPassword"
                  data-vv-as="New Password"
                  maxlength="21"
                />
                <span class="text-warning" v-if="errors.has('new_Password')">
                  {{ errors.first('new_Password') }}
                </span>
              </b-form-group>
              <b-form-group
                horizontal
                label="Confirm New Password"
                :label-cols="3"
                label-breakpoint="md"
                label-for="confirm_new_Password"
              >
                <input
                  v-validate.initial="{ required: this.isRequired,  min:8, max:20,confirmed:'new_Password' }"
                  name="confirm_new_Password"
                  :class="{ 'form-control': true, 'is-invalid': errors.has('confirm_new_Password')}"
                  type="password"
                  id="confirm_new_Password"
                  ref="confirm_new_Password"
                  v-model="confirmNewPassword"
                  data-vv-as="Confirm New Password"
                  maxlength="21"
                />
                <span class="text-warning" v-if="errors.has('confirm_new_Password')">
                  {{ errors.first('confirm_new_Password') }}
                </span>
              </b-form-group>
            <legend/>
            </fieldset>
            <div class="form-action">
              <b-button type="submit" variant="danger" class="btn-rounded right-button float-right" :disabled="this.errors.any()">
                Save Changes
              </b-button>
              <b-button type="button" variant="default" class="btn-rounded float-right" @click="cancelEvent">
                Cancel
              </b-button>
            </div>
          </b-form>
        </Widget>
      </b-col>
    </b-row>

    <loading
      :show="loadingShow"
      :label="loadingLabel"
      loader-class="loading">
    </loading>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';

export default {
  name: 'MyAccount',
  components: { Widget },
  created(){
    this.getUserAccount();
  },
  data() {
    return {
      /* LOADING */
      loadingShow: false,
      loadingLabel: 'Loading...',
      userAccount: [],
      userName: '',
      userEmail: '',
      userPhone: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      changePassword: '',
      isRequired: false,
      isSame: false,
      isUpdated: false,
      errorTitle: '',
      errorText: ''
    };
  },
  watch: {
    currentPassword: function(data){
       if(data != ''){
         this.isRequired = true;
       }else{
          this.isRequired = false;
       }
    },
    newPassword: function(data){
        if(data != ''){
         this.isRequired = true;
       }else{
          this.isRequired = false;
       }
    }
  },
  methods: {
    showCurrentPasswordErrorAlert() {
        this.$swal({
            title: 'ERROR',
            text: 'Please check your Current Password!',
            confirmButtonText: 'OK'
        });
    },
    showErrorAlert(status) {

        this.$swal({
            title: 'ERROR',
            text: status,
            confirmButtonText: 'OK'
        });
    },
    showSuccessrAlert() {
        this.$swal({
            title: 'Success',
            text: 'Changed Successfully!',
            confirmButtonText: 'OK'
        }).then(() => {
          this.resetPassword();
        });
    },
    async onSubmit(e) {

      e.preventDefault();
      const beforeUpdateResult = await this.beforeUpdate();
      
      this.$validator.validateAll()      
      .then((response) =>{
        if(!response){
          this.showErrorAlert('Please Check the validation!');
        }else{
          if(beforeUpdateResult){ 
            this.updateUserAccount();
          }else{
            this.showErrorAlert();
          }
        }
      })
      .catch((ex)=>{
          this.showErrorAlert(ex.response.status);
      });

    },
    getUserAccount(){
      this.loadingShow = true;
      this.$axios.get('/api/user/getMyAccount')
      .then((response) => {
          console.log(response);
          this.loadingShow = false;
          this.userAccount = response.data.resultBody;
          this.userName = response.data.resultBody.name;
          this.userEmail = response.data.resultBody.email;
          this.userPhone = response.data.resultBody.phone;
      })
      .catch((ex)=> {
          console.log(ex);
          this.loadingShow = false;
          this.showErrorAlert(ex.response.status);
      }) 
    },
    checkPassword(){
       this.loadingShow = true;
      return new Promise( (resolve, reject)=>{
        this.$axios.get('/api/user/checkPassword',{
          params: { userId: this.userAccount.id, password: this.currentPassword }
        })
        .then((response) => {
          console.log(response);
          this.loadingShow = false;
          this.isSame = response.data.resultBody;
          if(this.isSame){
            return resolve(this.isSame);
          }else{
            this.showCurrentPasswordErrorAlert();
            return reject(this.isSame);
          }
        })
        .catch((ex)=> {
            this.loadingShow = false;
            console.log(ex);
            return reject(Error(ex));
        })
      })
    },
    beforeUpdate(){
      return new Promise( (resolve, reject) => {

        if(this.isRequired){

          const checkPasswordResult = this.checkPassword();

          checkPasswordResult.then((response) => {
              if(response){
                return resolve(this.isSame);
              }else{
                return reject(this.isSame);
              }
          })
          .catch((ex) => {
            console.log(ex);
          })

        }else{
          return resolve(true);
        }
      })
    },
    updateUserAccount(){
       this.loadingShow = true;
      const updateUserUrl = '/api/user/updateUser/${userId}';

      this.$axios.put(updateUserUrl.replace("${userId}", this.userAccount.id), 
        { name: this.userAccount.name, email: this.userAccount.email, phone: this.userAccount.phone, password: this.newPassword, userRoleId: this.userAccount.userRoleId })
      .then((response) => {
          this.loadingShow = false;
         const updateResult = response.data.resultCode;
          if(updateResult=='200'){
             this.showSuccessrAlert();
          }else if(updateResult=='300'){
             this.showErrorAlert();
          }else{
              this.showErrorAlert(response.data.resultMessage);
          }

      })
      .catch((ex)=>{
          this.loadingShow = false;
          console.log(ex);
          this.showErrorAlert(ex.response.status);
       })

    },
    resetPassword(){
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
    },
    cancelEvent(){
      this.userAccount.email = this.userEmail;
      this.userAccount.phone = this.userPhone;
      this.resetPassword();
    }
  },
};
</script>

<style src="./MyAccount.scss" lang="scss" />