<template>
    <div>   
      <b-form @submit="onSubmit">
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
                  v-model="company"
                  :options="search_options"
                  index="value" 
                  label="label" 
                />
                <span class="text-danger" v-if="errors.has('company')">
                  {{errors.first('company')}}
                </span>
              </b-form-group>
              <b-form-group
                horizontal
                label="Role Name"
                :label-cols="3"
                label-breakpoint="md"
                label-for="roleName"
              >
                <input
                 v-validate="'required'"
                  name="roleName"
                  :class="{ 'form-control': true, 'is-invalid': errors.has('roleName')}"
                  type="text"
                  id="roleName"
                  v-model="roleDetail.roleName"
                  data-vv-as="Role Name"
                  maxlength="30"
                />
                <span class="text-danger" v-if="errors.has('roleName')">
                  {{ errors.first('roleName') }}
                </span>
              </b-form-group>
              <b-form-group
                horizontal
                label="Role Description"
                :label-cols="3"
                label-breakpoint="md"
                label-for="roleDesc"
              >
                <input
                  name="roleDesc"
                  :class="{ 'form-control': true, }"
                  type="text"
                  id="roleDesc"
                  v-model="roleDetail.roleDesc"
                  maxlength="50"
                />
              </b-form-group>
              <hr>
              <div class="menuSelect"> 
                <b-form-group
                    horizontal
                    label="Menu Authorization"
                    :label-cols="3"
                    label-breakpoint="md"
                    label-for="roleDesc"
                >
                  <treeselect v-model="menuId" 
                      :multiple="true" 
                      :options="treeOptions" 
                      :always-open="true"
                      :defaultExpandLevel="Infinity" 
                      :loading="true" 
                      :cacheOptions="false"
                      :placeholder="placeholderText"
                      :sort-value-by="sortValueBy" 
                      :value-consists-of="valueConsistsOf"
                      :max-height="290"/>
                </b-form-group>
              </div>
              <hr>
              <b-row>
                <b-col lg ="12"> 
                  <b-button type="submit" variant="primary" class="mb-xs mr-xs float-right" :disabled="this.errors.any() || isDisabled">Save</b-button>
                </b-col>
              </b-row>
            </fieldset>
      </b-form>
    </div>
</template>

<script>
import vSelect from 'vue-select';
import Treeselect from '@riophae/vue-treeselect';

export default {
  name: 'AddRole',
  components: {
    vSelect, Treeselect 
  },
  created(){
    this.getMenuTree();
    this.getCompany();
  },
  data() {
    return {
      roleDetail: {
        roleName: '',
        roleDesc: ''
      },
      companyList:[],
      company: 1001,
      // menuTree
      menuId: [],
      options:[],
      treeOptions:[],
      search_options: [],
      placeholderText:'Please select the menu',
      sortValueBy:'INDEX',
      valueConsistsOf:'LEAF_PRIORITY',
      isDisabled: false,
    };
  },
  methods: {
      showErrorAlert() {
        this.$swal({
            title: 'Error',
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
            this.addUserRole();
          }
        })
        .catch((ex)=>{
            this.showErrorAlert(ex.response.status);
        });

      },
      addUserRole(){
        this.isDisabled=true;
        this.$axios.post('/api/userRole/addUserRole',
        { userRole:this.roleDetail, menuId: this.menuId, companyId : this.company })
        .then((response) => {
          console.log(response);
            const insertResult = response.data.resultCode;
            
            if(insertResult=='200'){
              this.showSuccessrAlert();
              this.isDisabled = false;
            }else if(insertResult=='300'){
              this.showErrorAlert();
              this.isDisabled = false;
            } 
        })
        .catch((ex)=> {
            console.log(ex);
            this.isDisabled = false;
        }) 

      },
      getCompany(){

        this.$axios.get('/api/userRole/company')
        .then((response) => {
          console.log(response);
          this.companyList = response.data.resultBody;

          for(let i in this.companyList){
              this.search_options.push({
                value: this.companyList[i].id,
                label: this.companyList[i].name
              })
          }

        })
        .catch((ex)=> {
            console.log(ex);
        }) 

      },
      getMenuTree(){
        this.$axios.get('/api/menu/menuTree')
        .then((response) => {
          console.log(response);
          this.options = response.data.resultBody;

          for(const i in response.data.resultBody){
            const node = response.data.resultBody[i];
            if(response.data.resultBody[i].children.length == 0){
              const newNode = {
                id: node.id,
                label: node.label,
              }
              this.treeOptions.push(newNode);
            }else{
              this.treeOptions.push(node);
            }
          }

        })
        .catch((ex)=> {
            console.log(ex);
        }) 

      }
  }
}
</script>

<style src="../Role.scss" lang="scss" />
