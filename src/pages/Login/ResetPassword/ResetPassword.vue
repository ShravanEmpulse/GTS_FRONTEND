<template>
  <div class="reset-page">
    <b-row>
      <b-col lg='6' xs='12'  offset="3">
        <Widget
          title="<h2> </h2>" customHeader  >
          <h2> Reset password </h2> <br>
          <h5> To reset your password, enter your ID and E-mail. </h5>
          <p>The E-mail should be the same as the E-mail stored in your id.</p>
          <b-form @submit="onSubmit">
            <fieldset>
              <legend/>
              <b-form-group
                horizontal
                label="ID"
                :label-cols="3"
                label-breakpoint="md"
                label-for="id"
              >
                <input
                  v-validate.initial="{ required: true, min:5 }"
                  name="id"
                  :class="{ 'form-control': true, 'is-invalid': errors.has('id')}"
                  type="text"
                  id="id"
                  ref="id"
                  v-model="userId"
                  data-vv-as="ID"
                />
                <span class="text-warning" v-if="errors.has('id')">
                  {{ errors.first('id') }}
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
                  v-model="userEmail"
                  placeholder="email@email.com"
                  data-vv-as="E-mail"
                  maxlength="51"
                />
                <span class="text-warning" v-if="errors.has('email')">
                  {{ errors.first('email') }}
                </span>
              </b-form-group>
            <legend/>
            </fieldset>
            <div class="form-action">
              <b-button type="submit" variant="danger" class="btn-rounded right-button float-right" :disabled="this.errors.any()">
                Reset Password
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
  name: 'ResetPassword',
  components: { Widget },
  created(){
  },
  data() {
    return {
      /* LOADING */
      loadingShow: false,
      loadingLabel: 'Loading...',

      failMessage: "Failed to send the email. Please contact the admin.",

      userId: '',
      userEmail:'',
    };
  },
  methods: {
    showCurrentPasswordErrorAlert() {
        this.$swal({
            title: 'ERROR',
            text: 'Please check your ID and Email!',
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
            text: 'Reseted Successfully!',
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

      this.$validator.validateAll()      
      .then((response) =>{
        if(!response){
          this.showErrorAlert('Please Check the validation!');
        }else{
          this.resetPassword();
        }
      })
      .catch((ex)=>{
          this.showErrorAlert(ex.response.status);
      });
    },
    resetPassword(){
      this.$axios.get('/api/user/forgotPassword',{
        params: { userId: this.userId, userEmail: this.userEmail }
      })
      .then((response) => {
        console.log(response);
        if(response.status == '200' && response.data.resultCode == '200'){
          this.showSuccessrAlert();
        }else if(response.status == '200' && response.data.resultCode != ''){
          let errorMessage = this.failMessage;
          this.showErrorAlert(errorMessage);
        }
      })
      .catch((ex)=> {
          console.log(ex);
      })

    },

  },
};
</script>

<style src="./ResetPassword.scss" lang="scss" scoped />