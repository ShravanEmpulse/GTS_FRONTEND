<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Menu</span>    
    </h4>
          
    <b-row>
      <b-col lg="6">
        <Widget
          title="<h5>Menu</h5>"
          customHeader
        >
          <div class="menuTreeBox">
            <treeselect v-model="menuId" 
                        :multiple="false" 
                        :options="treeOptions" 
                        :always-open="true"
                        :defaultExpandLevel="Infinity" 
                        :cacheOptions="false"
                        :sort-value-by="sortValueBy" 
                        :value-consists-of="valueConsistsOf"
                        :max-height="450"/>
        </div>
        <div class="menuAddBtn">
          <b-button type="button" variant="danger" class="btn-rounded right-button float-right" @click="deleteMenuAction">
            Delete Menu
          </b-button>
          <b-button type="button" variant="primary" class="btn-rounded float-right" @click="addNodeAction">
            Add Menu
          </b-button>
        </div>
        </Widget>
      </b-col>

      <b-col lg="6">
          <Widget
          title="<h5>&nbsp; Menu Detail</h5>"
          customHeader
        >
          <div class="menuDetail">
            <hr>
            <b-form  @submit="onSubmit">
              <fieldset>
                <b-form-group
                  horizontal
                  label="Menu Title"
                  :label-cols="3"
                  label-breakpoint="md"
                  label-for="menuTitle"
                >
                  <input
                  v-validate="'required'"
                    name="menuTitle"
                    :class="{ 'form-control': true, 'is-invalid': errors.has('menuTitle')}"
                    type="text"
                    id="menuTitle"
                    v-model="menuDetail.title"
                    data-vv-as="Menu Title"
                    maxlength="30"
                  />
                  <span class="text-danger" v-if="errors.has('menuTitle')">
                    {{ errors.first('menuTitle') }}
                  </span>
                </b-form-group>
                <b-form-group
                  horizontal
                  label="Menu Description"
                  :label-cols="3"
                  label-breakpoint="md"
                  label-for="menuDesc"
                >
                  <input
                    name="menuDesc"
                    :class="{ 'form-control': true, }"
                    type="text"
                    id="menuDesc"
                    v-model="menuDetail.description"
                    maxlength="50"
                  />
                </b-form-group>
              </fieldset>
              <hr>
              <div class="form-action">
                <b-button type="submit" variant="danger" class="btn-rounded right-button float-right" :disabled="this.errors.any() || isDisabled">
                  Save
                </b-button>
                <b-button type="button" variant="default" class="btn-rounded float-right" @click="cancelAction" >
                  Cancel
                </b-button>
               </div>
            </b-form>
          </div>
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
import Treeselect from '@riophae/vue-treeselect';
import Vue from 'vue';

export default {
name: 'Menu',
  components: { Widget, Treeselect },
  created(){
    this.getMenuTree();
  },
  watch:{
    menuId: function(data){
      if(typeof data !== 'undefined'){
        this.getMenuDetail(data);
        if(typeof this.menuDetail === 'null'){
          this.menuDetail.menuTitle = 'New Menu';
        }
      }
    },
  },
  data() {
    return {
      loadingShow: false,
      loadingLabel: 'Loading...',
      // menuTree
      menuId: [],
      treeOptions:[],
      sortValueBy:'INDEX',
      valueConsistsOf:'LEAF_PRIORITY',
      menuDetail: [],
      defaultMenuDetail:[],
      isDisabled: false,
      newNodeCount: 0,
      newNodeId: '',
    }
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
          text: 'Saved Successfully!',
          confirmButtonText: 'OK'
      }).then(() => {
        window.location.reload();
      });
    },
    showDeleteSuccessrAlert() {
      this.$swal({
          title: 'Success',
          text: 'Deleted Successfully!',
          confirmButtonText: 'OK'
      }).then(() => {
        window.location.reload();
      });
    },
    deleteConfirmAlert(){
      this.$swal({
        title: 'Delete Menu',
        text: "Are you sure you want to do delete?",
        showCancelButton: true,
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
      }).then((result) => {
        if (result.value) {
          this.deleteMenu();
        }
      });
    },
    findMenuIndex(menuId){
      return this.treeOptions.findIndex((item,idx) =>{
        return item.id == menuId;
      })
    },
    onSubmit(e){
      e.preventDefault();

      this.$validator.validateAll()
      .then((response) =>{
        if(!response){
          this.showErrorAlert('Please Check the validation!');
        }else{

          if(this.menuId.length != 0){
            const splitMenuId = this.menuId.split('-');
            if(splitMenuId.length == 1){
              this.updateMenu(); 
            }else{
              if(splitMenuId[1] == this.newNodeId){
                this.addMenu();
              }else{
                this.updateMenu();
              }
            }
          }else{
            const errorMessage = "Please select the menu.";
            this.showErrorAlert(errorMessage);
          }
        }
      })
      .catch((ex)=>{
        this.showErrorAlert(ex.response.status);
      });
    },
    getMenuTree(){
      this.$axios.get('/api/menu/menuTree')
      .then((response) => {
        console.log(response);

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
    getMenuDetail(menuId){
      this.loadingShow = true;
      this.$axios.get('/api/menu/menuDetail',{
          params: { menuId: menuId }
       })
      .then((response) => {
        console.log(response);
        const result = response.data.resultBody;

        if(result == null){
           this.menuDetail.title='New Menu';
           this.menuDetail.description='';
            this.loadingShow = false;
        }else{
          this.menuDetail = result;
          this.defaultMenuDetail.title = this.menuDetail.title;
          this.defaultMenuDetail.description = this.menuDetail.description;

          this.loadingShow = false;
        }
      })
      .catch((ex)=> {
          console.log(ex);
          this.loadingShow = false;
      }) 
    },
    cancelAction(){
      this.menuDetail.title = this.defaultMenuDetail.title;
      this.menuDetail.description = this.defaultMenuDetail.description;
    },
    addMenu(){
      this.loadingShow = true;
      this.isDisabled=true;
      this.$axios.post('/api/menu/addMenu',
      { id: this.menuId, title: this.menuDetail.title, description: this.menuDetail.description
      })
      .then((response) => {
        console.log(response);
        const insertResult = response.data.resultCode;
          if(insertResult=='200'){
            this.showSuccessrAlert();
          }else if(insertResult=='300'){
            this.showErrorAlert();
          }
        this.loadingShow = false;
      })
      .catch((ex)=> {
          console.log(ex);
          this.loadingShow = false;
          this.showErrorAlert(ex.response.status);
      }) 
    },
    updateMenu(){
      this.loadingShow = true;
      this.isDisabled=true;
      const updateMenuUrl = '/api/menu/updateMenuDetail/${menuId}';

      this.$axios.put(updateMenuUrl.replace("${menuId}", this.menuId), 
      { title: this.menuDetail.title ,description: this.menuDetail.description })
      .then((response) => {
          console.log(response);
          const updateResult = response.data.resultCode;
          this.loadingShow = false;
          if(updateResult=='200'){
              this.showSuccessrAlert();
          }else if(updateResult=='300'){
              this.showErrorAlert(updateResult);
          }
      })
      .catch((ex)=>{
          console.log(ex);
          this.loadingShow = false;
          this.showErrorAlert(ex.response.status);
      })
    },
    async deleteMenuAction(){
      const resultOfMenu1st = await this.checkMenu1st(this.menuId);

      if(resultOfMenu1st){
        const errorMessage = "Cannot delete a menu at the first level.";
        this.showErrorAlert(errorMessage);
      }else{
        const splitMenuId = this.menuId.split('-');
        if(splitMenuId[1] == this.newNodeId){
          this.deleteNode();
        }else{
          this.deleteConfirmAlert(); 
        }
      }
    },
    deleteMenu(){
      this.loadingShow = true;
      this.isDisabled=true;
            
      const deleteMenuUrl = '/api/menu/deleteMenu/${menuId}';

      this.$axios.delete(deleteMenuUrl.replace("${menuId}", this.menuId))
      .then((response) => {
          console.log(response);
          const deleteResult = response.data.resultCode;
          this.loadingShow = false;
          this.isDisabled=false;
          if(deleteResult == '200'){
              this.showDeleteSuccessrAlert();
          }else if(deleteResult == '300'){
              this.showErrorAlert(deleteResult);
          }else if(deleteResult == '400'){
              this.showErrorAlert('This menu cannot delete. Please make sure you have any roles associated with this menu.');
          }
      })
      .catch((ex)=>{
          console.log(ex);
          this.loadingShow = false;
          this.isDisabled=false;
          this.showErrorAlert(ex.response.status);
      })
    },
    deleteNode(menuId){
      const splitMenuId = this.menuId.split('-');
      const menu1stIndex = this.findMenuIndex(splitMenuId[0]);

      this.treeOptions[menu1stIndex].children.pop();
      this.newNodeCount = 0;

    },
    async addNodeAction(){
      const menu1stId = this.menuId;
      const resultOfMenu1st = await this.checkMenu1st(menu1stId);

      if(resultOfMenu1st){
        this.newNodeId = await this.getNewChildIdByMenuId(menu1stId);
        if(this.newNodeId != false){
          this.addNewChild(this.newNodeId);
        }
      }else{
        const errorMessage = "Deny more leaf Menu.";
        this.showErrorAlert(errorMessage);
      }
    },
    addNewChild(){

      const menu1stIndex = this.findMenuIndex(this.menuId);

      const childrenArray = this.treeOptions[menu1stIndex].children;
      const menu1st = this.treeOptions[menu1stIndex];

     if(typeof childrenArray !== 'undefined'){

        const newChildNode = {
          id: this.menuId+"-"+this.newNodeId,
          label: 'New Menu',
        }

        if(this.newNodeCount == 0){
          childrenArray.push(newChildNode);
          this.newNodeCount = 1;
        }else{
          const errorMessage = "New Menu Node is added already.";
          this.showErrorAlert(errorMessage);
        }

     }else{
      const errorMessage = "Deny more leaf Menu.";
      this.showErrorAlert(errorMessage);
     }
    
    },
    getNewChildIdByMenuId(menuId){
      return new Promise( (resolve, reject) => {
        this.$axios.get('/api/menu/newChildIdByMenuId', 
        )
        .then((response) => {
          console.log(response);
          const newChildId = response.data.resultBody;
          return resolve(newChildId);
        })
        .catch((ex)=> {
            console.log(ex);
            this.showErrorAlert(errorMessage);
        }) 
      })
    },
    checkMenu1st(menuId){
      return new Promise( (resolve, reject) => {
        const splitId = menuId.split('-');
        if(splitId.length == 1){
          return resolve(true);
        }else{
          return resolve(false);
        }
      })
    }
  }
}
</script>


<style src="./Menu.scss" lang="scss"  />