<template>
    <div>   
      <b-form  @submit="onSubmit">
        <fieldset>
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
              v-model="user.role"
              :options="search_options"
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
              v-if="user.role.value=='2'"
            >
              <input
                v-validate="{  max:30, required: true, alpha_dash: true }"
                name="dealer_Code"
                :class="{ 'form-control': true, 'is-invalid': errors.has('dealer_Code')}"
                type="text"
                id="dealer_Code"
                v-model="userEnrollments.dealerCode"
                data-vv-as="Dealer Code"
                maxlength="31"
              />
              <span class="text-danger" v-if="errors.has('dealer_Code')">
                {{ errors.first('dealer_Code') }}
              </span>
          </b-form-group>
          <hr>
          <b-form-group
              horizontal
              label="ID"
              :label-cols="3"
              label-breakpoint="md"
              label-for="id"
            >
              <input
                v-validate="{ required: true, min:5, max:20, alpha_dash: true }"
                name="id"
                :class="{ 'form-control': true, 'is-invalid': errors.has('id')}"
                type="text"
                id="id"
                v-model="user.id"
                data-vv-as="ID"
                maxlength="21"
              />
              <span class="text-danger" v-if="errors.has('id')">
                {{ errors.first('id') }}
              </span>
            </b-form-group>
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
                maxlength="31"
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
                :class="{ 'form-control': true,  max:50,'is-invalid': errors.has('email')}"
                type="text"
                id="email"
                placeholder="email@email.com"
                v-model="user.email"
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
              label="Password"
              :label-cols="3"
              label-breakpoint="md"
              label-for="password"
            >
              <input
                v-validate="{ required: true, min:8, max:20, regex: /(?=.{8,})((?=.*\d)(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)(?=.*[a-zA-Z])(?=.*[\W_])|(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])).*/ }"
                name="password"
                :class="{ 'form-control': true, 'is-invalid': errors.has('password')}"
                type="password"
                id="password"
                ref="password"
                v-model="user.password"
                data-vv-as="Password"
                maxlength="21"
              />
              <span class="text-danger" v-if="errors.has('password')">
                {{ errors.first('password') }}
              </span>
            </b-form-group>
            <b-form-group
              horizontal
              label="Confirm Password"
              :label-cols="3"
              label-breakpoint="md"
              label-for="password_repeat"
            >
              <input
                v-validate="{ required: true, min:8, max:20, confirmed:'password' }"
                name="password_repeat"
                :class="{ 'form-control': true, 'is-invalid': errors.has('password_repeat')}"
                type="password"
                id="password_repeat"
                data-vv-as="Confirm Password"
                maxlength="21"
              />
              <span class="text-danger" v-if="errors.has('password_repeat')">
                {{errors.first('password_repeat')}}
              </span>
            </b-form-group>
            <hr>
          </fieldset>
            <b-row>
              <b-col lg ="12"> 
                <b-button type="submit" variant="primary" class="mb-xs mr-xs float-right" :disabled="this.errors.any()">Save</b-button>
                <!--   <b-button variant="secondary" class="mb-xs mr-xs float-right">Cancle</b-button> -->
              </b-col>
            </b-row>
        </b-form>
      <loading
          :show="loadingShow"
          :label="loadingLabel"
          loader-class="loading">
      </loading>
    </div>
</template>

<script>
import vSelect from 'vue-select';

export default {
  name: 'AddUser',
  components: {
    vSelect
  },
  data() {
    return {
      user: {
        id: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        role: { value: '2', label: 'DEALER ROLE' },
        userRoleId: '',
      },
      userEnrollments: {
         companyId: '',
         dealerCode: '',
      },

      isDuplicated:null,
      search_options: [],
      userRole: [],
      companyList:[],
      company: 0,
      company_search_options: [],
       /* LOADING */
      loadingShow: false,
      loadingLabel: 'Loading...',
    };
  },
  created() {
    this.getUserRoleList(); 
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
      showSuccessrAlert() {
            this.$swal({
                title: 'Success',
                text: 'Added Successfully!',
                confirmButtonText: 'OK'
            }).then(() => {
              window.location.reload();
          });
      },
      onSubmit(e){
        e.preventDefault();

        this.$validator.validateAll()
        .then((response) =>{
          if(!response){
            this.showErrorAlert('Please Check the validation!');
          }else{
            this.addUser();
          }
        })
        .catch((ex)=>{
          this.showErrorAlert(ex.response.status);
        });

      },
      addUser(){

        this.loadingShow = true;
        this.user.userRoleId = this.user.role.value;

        this.$axios.post('/api/user/addUser',
        { user: this.user, userEnrollments: this.userEnrollments
        })
        .then((response) => {
          console.log(response);
          const insertResult = response.data.resultCode;
            if(insertResult=='200'){
              this.showSuccessrAlert();
            }else if(insertResult=='300'){
              this.showErrorAlert();
            }else{
              this.showErrorAlert(response.data.resultMessage);
            }
          this.loadingShow = false;
        })
        .catch((ex)=> {
            console.log(ex);
            this.loadingShow = false;
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
          if(this.companyList.length==1){
            this.userEnrollments.companyId = this.companyList[0].id;
          }else{
            this.userEnrollments.companyId = 1001;
          }
        })
        .catch((ex)=> {
            console.log(ex);
        }) 
    },
      getUserRoleList(){
        this.loadingShow = true;
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
          this.loadingShow = false;
        })
        .catch((ex)=> {
            console.log(ex);
            this.loadingShow = false;
            this.showErrorAlert(ex.response.status);
        }) 
      }
  }
}
</script>

<style>

</style>
