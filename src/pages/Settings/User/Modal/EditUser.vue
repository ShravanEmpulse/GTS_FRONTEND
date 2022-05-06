<template>
    <div>
       <b-form @submit="onSubmit">
            <fieldset>
            <div>
              <b-row>
                <b-col lg="7">
                  <h2><i class="la la-user" />&nbsp;{{user.id}}</h2>
                </b-col>
                <b-col lg ="5"> 
                  <b-button variant="outline-warning" class="mb-xs mr-xs float-right" @click="resetConfirmAlert">RESET PASSWORD</b-button>
                  <b-button variant="outline-danger" class="mb-xs mr-xs float-right" @click="deleteConfirmAlert">DELETE USER</b-button>
                </b-col>
              </b-row>
            </div>
            <hr>
            <b-form-group
                label="COMPANY"
                label-for="company"
                :label-cols="3"
              >
                <v-select
                  v-validate="{ required: true }"
                  id="company"
                  name="company"
                  data-vv-as="COMPANY"
                  v-model="userEnrollments.companyId"
                  :options="company_search_options"
                  index="value" 
                  label="label" 
                />
                <span class="text-danger" v-if="errors.has('company')">
                  {{errors.first('company')}}
                </span>
            </b-form-group>
            <b-form-group
              label="ROLE"
              label-for="role"
              :label-cols="3"
            >
            <v-select
                v-validate="{ required: true }"
                id="role"
                name="role"
                data-vv-as="ROLE"
                v-model="user.userRoleId"
                :options="search_options"
                index="value" 
                label="label" 
              />
              <span class="text-danger" v-if="errors.has('role')">
                {{errors.first('role')}}
              </span>
            </b-form-group>
            <b-form-group
                horizontal
                label="DEALER CODE"
                :label-cols="3"
                label-breakpoint="md"
                label-for="dealer_Code"
                v-if="user.userRoleId=='2'"
              >
                <input
                 v-validate="{ max:30, required: true, alpha_dash: true }"
                  name="dealer_Code"
                  :class="{ 'form-control': true, 'is-invalid': errors.has('dealer_Code')}"
                  type="text"
                  id="dealer_Code"
                  data-vv-as="Dealer Code"
                  v-model="userEnrollments.dealerCode"
                  maxlength="31"
                />
                <span class="text-danger" v-if="errors.has('dealer_Code')">
                  {{ errors.first('dealer_Code') }}
                </span>
            </b-form-group>
            <hr>
              <b-form-group
                horizontal
                label="Name"
                :label-cols="3"
                label-breakpoint="md"
                label-for="name"
              >
                <input
                  v-validate="{ max:50 }"
                  name="name"
                  :class="{ 'form-control': true,  max:50, 'is-invalid': errors.has('name')}"
                  type="text"
                  id="name"
                  maxlength="51"
                  v-model="user.name"
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
                  :class="{'form-control': true, 'is-invalid': errors.has('email')}"
                  type="text"
                  id="email"
                  v-model="user.email"
                  placeholder="email@email.com"
                  data-vv-as="E-mail"
                  maxlength="51"
                />
                <span class="text-danger" v-if="errors.has('email')">
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
                  v-model="user.phone"
                  data-vv-as="Phone"
                />
              </b-form-group>
            <hr>
            <b-form-group
                horizontal
                label="New Password"
                :label-cols="3"
                label-breakpoint="md"
                label-for="password"
              >
                <input
                  v-validate="{ required: this.isRequired, min:8,  max:20, regex: /(?=.{8,})((?=.*\d)(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)(?=.*[a-zA-Z])(?=.*[\W_])|(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])).*/ }"
                  name="password"
                  :class="{ 'form-control': true, 'is-invalid': errors.has('password')}"
                  type="password"
                  id="password"
                  ref="password"
                  v-model="newPassword"
                  data-vv-as="New Password"
                  maxlength="21"
                />
                <span class="text-danger" v-if="errors.has('password')">
                  {{ errors.first('password') }}
                </span>
              </b-form-group>
              <b-form-group
                horizontal
                label="Confirm New Password"
                :label-cols="3"
                label-breakpoint="md"
                label-for="password_repeat"
              >
                <input
                  v-validate="{ required: this.isRequired, min:8,  max:20, confirmed:'password' }"
                  name="password_repeat"
                  :class="{ 'form-control': true, 'is-invalid': errors.has('password_repeat')}"
                  type="password"
                  id="password_repeat"
                  data-vv-as="Confirm New Password"
                  maxlength="21"
                />
                <span class="text-danger" v-if="errors.has('password_repeat')">
                  {{errors.first('password_repeat')}}
                </span>
              </b-form-group>
              </fieldset>
              <hr>
              <b-row>
                <b-col lg ="12"> 
                  <b-button type="submit" variant="primary" class="mb-xs mr-xs float-right" :disabled="this.errors.any() || isDisabled">Save Changes</b-button>
                </b-col>
              </b-row>
          </b-form>
    </div>

</template>
    
<script>
import vSelect from 'vue-select';

export default {
  name: 'EditUser',
  components: {
    vSelect
  },
  data() {
    return {
      user:[],
      userEnrollments:[],
      newPassword:'',
      isRequired: false,
      companyList:[],
      search_options: [],
      company_search_options: [],
      dealerCode: '',
      isDisabled: false,
      userRole:'',
      changeSuccessMessage: 'Changed Successfully!',
      deleteSuccessMessage: 'Deleted Successfully!',
      resetSuccessMessage: 'Reseted Successfully!'
    };
  },
  watch: {
    newPassword: function(data){
      if(data != ''){
        this.isRequired = true;
      }else{
        this.isRequired = false;
      }
    }
  },
  created(){
    this.getUserRoleList();
    this.checkUserRole();
    this.getCompany();
  },
  methods: {
    showErrorAlert(status) {
      this.$swal({
          title: 'Error',
          text: status,
          confirmButtonText: 'OK'
      });
    },
    showSuccessrAlert(successMessage) {
      this.$swal({
          title: 'Success',
          text: successMessage,
          confirmButtonText: 'OK'
      }).then(() => {
        window.location.reload();
      });
    },
    checkUserRole(){
      this.userRole = window.sessionStorage.getItem('Role');
    },
    resetConfirmAlert(){
      this.$swal({
          title: 'Reset User',
          text: "Are you sure you want to reset this user?",
          showCancelButton: true,
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes'
      }).then((result) => {
        if (result.value) {
          this.resetUserPassword();
        }
      });
    },
    deleteConfirmAlert(){
      this.$swal({
          title: 'Delete User',
          text: "Are you sure you want to do delete?",
          showCancelButton: true,
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes'
      }).then((result) => {
        if (result.value) {
          this.deleteUser();
        }
      });
    },
    onSubmit(e){

      e.preventDefault();
          
      this.$validator.validateAll()
      .then((response) =>{
        if(!response){
          this.showErrorAlert('Please Check the validation!');
        }else{
          this.updateUser();
        }
      })
      .catch((ex)=>{
          this.showErrorAlert(ex.response.status);
      });

    },
    updateUser(){
      this.isDisabled=true;
      const updateUserUrl = '/api/user/updateUserByAdmin/${userId}';
      this.user.password = this.newPassword;

      console.log(this.user);
      console.log(this.userEnrollments);

      this.$axios.put(updateUserUrl.replace("${userId}", this.user.id), 
        { user: this.user, userEnrollments: this.userEnrollments })
      .then((response) => {
          console.log(response);
          const updateResult = response.data.resultCode;
          if(updateResult=='200'){
              this.showSuccessrAlert(this.changeSuccessMessage);
              this.isDisabled = false;
          }else if(updateResult=='300'){
              this.showErrorAlert(updateResult);
              this.isDisabled = false;
          }else{
              this.showErrorAlert(response.data.resultMessage);
              this.isDisabled = false;
          }
      })
      .catch((ex)=>{
          console.log(ex);
          this.showErrorAlert(ex.response.status);
      }) 

    },
    getCompany(){
        this.$axios.get('/api/userRole/company')
        .then((response) => {
          console.log(response);
          this.companyList = response.data.resultBody;
          for(let i in this.companyList){
              this.company_search_options.push({
                value: this.companyList[i].id,
                label: this.companyList[i].name
              })
          }
        })
        .catch((ex)=> {
            console.log(ex);
        }) 
    },
    getUserRoleList(){
      this.$axios.get('/api/userRole/userRoleList')
      .then((response) => {
        console.log(response);
        this.userRole = response.data.resultBody;

        for(let i in this.userRole){
            this.search_options.push({
              value: this.userRole[i].id,
              label: this.userRole[i].roleDesc
            })
        }
      })
      .catch((ex)=> {
          console.log(ex);
          this.showErrorAlert(ex.response.status);
      })
    },
    deleteUser(){
        
      const deleteUserUrl = '/api/user/deleteUser/${userId}';

      this.$axios.delete(deleteUserUrl.replace("${userId}", this.user.id))
      .then((response) => {
          console.log(response);
          const deleteResult = response.data.resultCode;
          if(deleteResult == '200'){
              this.showSuccessrAlert(this.deleteSuccessMessage);
          }else if(deleteResult == '300'){
              this.showErrorAlert(deleteResult);
          }else if(deleteResult == '400'){
              this.showErrorAlert('This User Can Not Delete.');
          }
      })
      .catch((ex)=>{
          console.log(ex);
          this.showErrorAlert(ex.response.status);
      })

    },
    resetUserPassword(){

      const resetUserPasswordUrl = '/api/user/resetUserPassword/${userId}';

      this.$axios.get(resetUserPasswordUrl.replace("${userId}", this.user.id))
      .then((response) => {
          console.log(response);
          const resetResult = response.data.resultCode;
          if(resetResult == '200'){
              this.showSuccessrAlert(this.resetSuccessMessage);
          }else if(resetResult == '300'){
              this.showErrorAlert(response.data.resultBody);
               this.isDisabled = false;
          }else{
              this.showErrorAlert(response.data.resultMessage);
              this.isDisabled = false;
          }
      })
      .catch((ex)=>{
          console.log(ex);
          this.showErrorAlert(ex.response.status);
      })


    }
    
  }
}
</script>
