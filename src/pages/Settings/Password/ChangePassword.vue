<template>
  <div class="change-page">
    <b-row>
      <b-col lg='6' xs='12'  offset="3">
        <Widget
          title="<h2> </h2>" customHeader  >
          <h2> Please change your password. </h2> <br>
          <h5>  {{ this.resultMessage }}  </h5>
          <b-form @submit="onSubmit">
            <fieldset>
              <legend/>
              <b-form-group
                horizontal
                label="Current Password"
                :label-cols="3"
                label-breakpoint="md"
                label-for="current_Password"
              >
                <input
                  v-validate.initial="{ required: true, min:8, max:20 }"
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
                  v-validate.initial="{ required: true, min:8, max:20,regex: /(?=.{8,})((?=.*\d)(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)(?=.*[a-zA-Z])(?=.*[\W_])|(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])).*/  }"
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
                  v-validate.initial="{ required: true,  min:8, max:20,confirmed:'new_Password' }"
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
                Save
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
  name: 'ChangePassword',
  components: { Widget },
  created(){
    this.userId = this.$route.params.id;
    this.resultMessage = this.$route.params.message;
  },
  data() {
    return {
      /* LOADING */
      loadingShow: false,
      loadingLabel: 'Loading...',

      userId: '',
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      isSame: false,
      resultMessage: '',
    };
  },
  watch: {
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
            window.sessionStorage.clear();
            this.$router.push({
              name: 'Login'
            });
        });
    },
    async onSubmit(e) {

      e.preventDefault();
      this.$validator.validateAll();

      const beforeUpdateResult = await this.beforeUpdate();
      
      if(beforeUpdateResult){ 
        this.changePassword();
      }else{
        this.showErrorAlert();
      }

    },
    checkPassword(){
      this.loadingShow = true;
      return new Promise( (resolve, reject)=>{
        this.$axios.get('/api/user/checkPassword',{
          params: { userId: this.userId, password: this.currentPassword }
        })
        .then((response) => {
          console.log(response);
          this.isSame = response.data.resultBody;
          this.loadingShow = false;
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

        const checkPasswordResult = this.checkPassword();

        checkPasswordResult.then((response) => {
            this.loadingShow = false;
            if(response){
              return resolve(this.isSame);
            }else{
              return reject(this.isSame);
            }
        })
        .catch((ex) => {
          this.loadingShow = false;
          console.log(ex);
        })

      })
    },
    changePassword(){
      this.loadingShow = true;
      const changePasswordUrl = '/api/user/changePassword/${userId}';

      this.$axios.put(changePasswordUrl.replace("${userId}",  this.userId),
      { id: this.userId, password: this.newPassword }
      )
      .then((response) => {
         const updateResult = response.data.resultCode;
         this.loadingShow = false;
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
  },
};
</script>

<style src="./ChangePassword.scss" lang="scss" />