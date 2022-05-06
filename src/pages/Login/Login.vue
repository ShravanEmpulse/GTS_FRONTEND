<template>
  <div class="login-page">
    <b-container>
      <Widget class="mx-auto" customHeader>   
        <img src="../../assets/svg/logo_hdg_hor.svg" alt="" height="80" class="main-logo" />    
        <hr>    
        <form class="mt" @submit.prevent="login">
          <b-alert class="alert-sm fw-semi-bold" variant="warning" :show="!!errorMessage">
            {{errorMessage}}
          </b-alert>
          <b-form-group label="ID" label-for="username-input">
            <b-input-group class="input-group-transparent">
              <b-input-group-text slot="prepend"><i class="fa fa-user text-white"></i></b-input-group-text>
              <b-form-input id="username-input"
                            class="input-transparent pl-0"
                            type="text"
                            v-model="form.id"
                            required
                            placeholder="ID"
                            maxlength="30"
                            v-validate="'required|alpha_num'" />
            </b-input-group>
          </b-form-group>
          <b-form-group label="Password" label-for="password-input">
            <b-input-group class="input-group-transparent">
              <b-input-group-text slot="prepend"><i class="fa fa-lock text-white"></i></b-input-group-text>
              <b-form-input id="password-input"
                            class="input-transparent pl-0"
                            type="password"
                            v-model="form.password"
                            required
                            placeholder="Password"
                            maxlength="50"
                            v-validate="'required'" />
            </b-input-group>
          </b-form-group>
                      
          <div class="widget-bottom-overflow bg-widget mt-5 px-4 py-3">
            <b-button class="btn-block btn-lg fs-normal" type="submit" variant="primary" :disabled="isDisabled">
              SIGN IN
            </b-button>
          </div>
        </form>
      </Widget>
      <div class="widget-middle-overflow mt-2 px-4 py-2 forgot_password">
          <a href="/resetPassword">
            Forgot  Password?
          </a>
      </div>
    </b-container>
    <footer class="footer">
        &copy; GLOVIS. All rights reserved.
    </footer>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';

export default {
  name: 'LoginPage',
  components: { Widget },
  data () {
    return {
      errorMessage: '',
      form: {
        id: '',
        password: '',
      },
      isDisabled:false,
    };
  },
  methods: {
    login () {
      this.isDisabled=true;
      const username = this.form.id;

      this.$axios.post('/api/authentications', this.form)
      .then( (response) => {
        // console.log(response);
        if(response.status == '200' && response.data == ""){
          window.sessionStorage.setItem('Dorothy-Auth-Token', response.headers['dorothy-auth-token']);
          this.checkRole();

        }else if(response.status == '200' && ( response.data.resultCode == '1003' || response.data.resultCode == '1005') ){
          window.sessionStorage.setItem('Dorothy-Auth-Token', response.headers['dorothy-auth-token']);
          this.$router.push({
            name: 'ChangePasswordPage',
            params: { id : username, message: response.data.resultMessage }
          }); 
        }else if(response.status == '200' && response.data.resultCode != ""){
          this.errorMessage = response.data.resultMessage;
        }else{
          this.errorMessage = "Invalid request. Please sign in again.";
        }
        this.isDisabled=false;
      })
      .catch( (ex) => {
        // console.log(ex);
        if(ex.response.status == '401'){
          this.errorMessage = "Check Your ID and Password.";
        }else{
          this.errorMessage = ex.response.statusText;
        }
        this.isDisabled=false;
      });
    },
    checkRole(){
      const token = window.sessionStorage.getItem('Dorothy-Auth-Token');
      const role = this.$jwt.decode(token).jti;
      window.sessionStorage.setItem('Role',role);

      if(role == "ADMIN"){
        this.$router.push({
          name: 'Dashboard',
        });
      }else if(role == "SUPERVISOR"){
        this.$router.push({
          name: 'SupervisorDashboard',
        });
      }else if(role == "GENISYS" || role == "GENISYS USER" ){
        this.$router.push({
          name: 'GenisysMapPage',
        });
      }else if(role == "DEALER" || role == "USER" || role == "KMI_USER"){
        this.$router.push({
          name: 'MapPage',
        });
      }else if( role == "DOMESTIC" || role == "DOMESTIC USER" ) {
        this.$router.push({
          name: 'DomesticMapPage',
        });
      }else{
        this.$router.push({
          name: 'MyAccountPage',
        });
      }

    }
  },
  created () {
    if (  window.sessionStorage.getItem('Dorothy-Auth-Token') ) {
         this.checkRole();
    }
  },
};
</script>

<style src="./Login.scss" lang="scss" scoped />
