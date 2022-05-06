<template>
    <div>
       <b-form @submit="onSubmit">
            <fieldset>
              <div>
                <b-row>
                  <b-col lg ="5" offset-lg="7"> 
                    <b-button variant="outline-danger" class="mb-xs mr-xs float-right" @click="deleteConfirmAlert">DELETE ROLE</b-button>
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
                label-for="company"
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
                  <b-button type="submit" variant="primary" class="mb-xs mr-xs float-right" :disabled="this.errors.any() || isDisabled">Save Changes</b-button>
                </b-col>
              </b-row>
            </fieldset>
      </b-form>
    </div>
</template>
    
<script>
import Treeselect from '@riophae/vue-treeselect';
import vSelect from 'vue-select';

export default {
    name: 'EditRole',
    components: {
      Treeselect, vSelect
    },
    data() {
      return {
        roleDetail:[],
        // menuTree
        menuId: [],
        options:[],
        treeOptions:[],
        companyList:[],
        company: 0,
        search_options: [],
        placeholderText:'Please select the menu',
        sortValueBy:'INDEX',
        valueConsistsOf:'LEAF_PRIORITY',
        isDisabled: false,
        changeSuccessMessage: 'Changed Successfully!',
        deleteSuccessMessage: 'Deleted Successfully!'
      };
    },
    watch: {
      company: function(data){
        this.getRoleMenuMstByRoleId(this.roleDetail.id,data);
      },
    },
    created(){
      this.getMenuTree();
      this.getCompany();
    },
    computed:{

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
      deleteConfirmAlert(){
        this.$swal({
          title: 'Delete Role',
          text: "Are you sure you want to do delete?",
          showCancelButton: true,
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes'
        }).then((result) => {
          if (result.value) {
            this.deleteRole();
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
            this.updateRole();
          }
        })
        .catch((ex)=>{
            this.showErrorAlert(ex.response.status);
        });
        
      },
      updateRole(){

        this.isDisabled=true;
        const updateUserRoleUrl = '/api/userRole/updateUserRole/${roleId}';

        this.$axios.put(updateUserRoleUrl.replace("${roleId}", this.roleDetail.id), 
        { userRole:this.roleDetail, menuId: this.menuId, companyId : this.company })
        .then((response) => {
          console.log(response);
          const updateResult = response.data.resultCode;
            if(updateResult=='200'){
              this.showSuccessrAlert(this.changeSuccessMessage);
              this.isDisabled = false;
            }else if(updateResult=='300'){
              this.showErrorAlert();
              this.isDisabled = false;
            }
        })
        .catch((ex)=>{
            console.log(ex);
            this.showErrorAlert(ex.response.status);
            this.isDisabled = false;
        })

      },
      deleteRole(){
      
        const deleteRoleUrl = '/api/userRole/deleteUserRole/${roleId}';

        this.$axios.delete(deleteRoleUrl.replace("${roleId}", this.roleDetail.id))
        .then((response) => {
            console.log(response);
            const deleteResult = response.data.resultCode;
            if(deleteResult == '200'){
                this.showSuccessrAlert(this.deleteSuccessMessage);
            }else if(deleteResult == '300'){
                this.showErrorAlert(deleteResult);
            }else if(deleteResult == '400'){
                this.showErrorAlert('This role cannot delete. Please check the user under this role first.');
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

      },
      getRoleMenuMstByRoleId(roleId,companyId){

        this.company = companyId;

        const getRoleMenuMstUrl = '/api/userRole/roleMenuMst/${roleId}';
        this.$axios.get(getRoleMenuMstUrl.replace("${roleId}", roleId),{
          params: { companyId: companyId }
        })
        .then((response) => {
          console.log(response);
          this.menuId = response.data.resultBody;
        })
        .catch((ex)=> {
            console.log(ex);
        }) 

      }

    }
}
</script>
    
<style src="../Role.scss" lang="scss" />
    