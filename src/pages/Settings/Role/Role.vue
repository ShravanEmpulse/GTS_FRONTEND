<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Role</span>    
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
            worksheet = "Role"
            type    = "csv"
            :fields ="excel_fields"
            name    = "Role.csv">
            EXPORT EXCEL
          </download-excel>

          <b-button variant="outline-info" class="float-right"  v-b-modal.addRole>
             ADD ROLE
          </b-button>
        </div> 

        <v-client-table class="userRoleTableClass" ref="roleTable" :data="tableData" :columns="columns" :options="options" >
            <template slot="edits" slot-scope="{ row }">
              <b-button variant="outline-warning" @click="editRole(row.id)" v-b-modal.editRole><i class="fa fa-edit" /></b-button>
            </template>
        </v-client-table>
      </div>
    </Widget>

    <b-modal id="editRole" size="lg" title="EDIT ROLE" body-class="bg-white" hide-footer scrollable >
        <EditRole ref="editRoleForm"/>
    </b-modal>

    <b-modal id="addRole" size="lg" title="ADD ROLE" body-class="bg-white"  hide-footer scrollable >
        <AddRole ref="addRoleForm" />
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
import EditRole from './Modal/EditRole';
import AddRole from './Modal/AddRole';

export default {
  name: 'Role',
  components: { Widget, AddRole, EditRole },
  data() {
    return {
        /* LOADING */
        loadingShow: false,
        loadingLabel: 'Loading...',
        tableData: [],
        columns: ['id', 'roleName','roleDesc','edits'],
        options: {
          filterByColumn: true,
          perPage: 10,
          perPageValues: [],
          pagination: { chunk: 5, dropdown: false },
          skin: 'table table-striped',
          filterable: ['id', 'roleName','roleDesc'],
          columnClasses: ['text-center'],
          headings: {
            roleName: 'Role Name',
            roleDesc: 'Role Description'
          },
          texts:{
            filterBy: "Search by...",
          },
        },
        excel_fields: {
          'ID': 'id',
          'ROLE NAME': 'roleName',
          'ROLE DESCRIPTION': 'roleDesc'
        },
    };
  },
  beforeCreate() {
  },
  created() {
    this.getRoleList(); 
  },
  mounted(){
  },
  computed: {
    exportData(){
      if(typeof this.$refs.roleTable !== 'undefined'){
        return this.$refs.roleTable.allFilteredData;
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
            title: 'Errors',
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
    getRoleList(){
      this.loadingShow = true;
      this.$axios.get('/api/userRole/userRoleList')
      .then((response) => {
        console.log(response);
        this.loadingShow = false;
        this.tableData = response.data.resultBody;
      })
      .catch((ex)=> {
          console.log(ex);
          this.loadingShow = false;
          this.showErrorAlert(ex.response.status);
      }) 
      
    },
    editRole(roleId){
      this.loadingShow = true;
      this.$axios.get('/api/userRole/userRoleDetail',{
          params: { roleId: roleId }
      })
      .then((response) => {
        console.log(response);
        this.loadingShow = false;
        this.$refs.editRoleForm.roleDetail = response.data.resultBody;
      })
      .catch((ex)=> {
          console.log(ex);
          this.loadingShow = false;
          this.showErrorAlert(ex.response.status);
      }) 
      const companyId = 1001;
      this.$refs.editRoleForm.getRoleMenuMstByRoleId(roleId,companyId);
    },

  }
};
</script>

<style src="./Role.scss" lang="scss" />