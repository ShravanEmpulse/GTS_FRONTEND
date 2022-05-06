<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>User</span>    
    </h4> 
    <Widget
      title="<h4></h4>"
      customHeader
    >
      <div class="widget-middle-overflow">

        <div class="buttons">
          <download-excel
            class   = "btn btn-outline-default"
            :data   = "exportData"
            worksheet = "User"
            type    = "csv"
            :fields ="excel_fields"
            name    = "User.csv">
            EXPORT EXCEL
          </download-excel>

          <b-button variant="outline-info" class="float-right"  v-b-modal.addUser>
             ADD USER
          </b-button>
        </div> 

        <v-client-table class="userTableClass" ref="userTable" :data="tableData" :columns="columns" :options="options" >
            <template slot="edits" slot-scope="{ row }">
              <b-button variant="outline-warning" @click="editUser(row.id)" v-b-modal.editUser><i class="fa fa-edit" /></b-button>
            </template>
        </v-client-table>
      </div>
    </Widget>

    <b-modal id="editUser" size="lg" title="EDIT USER" body-class="bg-white" hide-footer>
        <EditUser ref="editUserForm"/>
    </b-modal>

      <b-modal id="addUser" size="lg" title="ADD USER" body-class="bg-white"  hide-footer>
        <AddUser ref="addUserForm" />
    </b-modal>

    <loading
     :show="loadingShow"
     :label="loadingLabel"
     loader-class="loading">
    </loading>
  </div>
</template>
<script>
import Widget from '@/components/Widget/Widget';
import EditUser from './Modal/EditUser';
import AddUser from './Modal/AddUser';

export default {
  name: 'User',
  components: { Widget,EditUser,AddUser },
  data() {
    return {
      loadingShow: false,
      loadingLabel: 'Loading...',
      tableData: [],
      columns: ['userRoleName','id', 'name','email', 'phone', 'edits'],
      options: {
        filterByColumn: true,
        perPage: 10,
        perPageValues: [],
        pagination: { chunk: 5, dropdown: false },
        skin: 'table table-striped',
        filterable: ['userRoleName','id', 'name','email', 'phone'],
        columnClasses: ['text-center'],
        headings: {
          userRoleName: 'User Role',
        },
        texts:{
            filterBy: "Search by...",
            defaultOption: "ALL",
        },
      },
      excel_fields: {
        'USER ROLE': 'userRoleName',
        'ID': 'id',
        'NAME': 'name',
        'EMAIL': 'email',
        'PHONE': 'phone'
      },
    };
  },
  beforeCreate() {
  },
  created() {
    this.getUserList();
  },
  mounted(){
  },
  computed: {
    exportData(){
      if(typeof this.$refs.userTable !== 'undefined'){
        return this.$refs.userTable.allFilteredData;
      }else{
        return this.tableData;
      }
    }
  },
  watch: {
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
            text: 'Changed Successfully!',
            confirmButtonText: 'OK'
        }).then(() => {
          window.location.reload();
      });
      },
      getUserList(){

        this.$axios.get('/api/user/userList')
        .then((response) => {
          console.log(response);
          this.tableData = response.data.resultBody;
        })
        .catch((ex)=> {
            console.log(ex);
            this.showErrorAlert(ex.response.status);
        }) 
        
      },
      editUser(userId){
        this.loadingShow = true;

        this.$axios.get('/api/user/getUserDetail',{
            params: { userId: userId }
        })
        .then((response) => {
          console.log(response);
          this.$refs.editUserForm.user = response.data.resultBody.user;
          this.$refs.editUserForm.userEnrollments = response.data.resultBody.userEnrollments;
          this.loadingShow = false;
        })
        .catch((ex)=> {
            console.log(ex);
            this.loadingShow = false;
            this.showErrorAlert(ex.response.status);
        }) 

      },
      addUser(){
          this.$refs.addUserForm.show();
      },
  }
};
</script>

<style src="./User.scss" lang="scss" />
