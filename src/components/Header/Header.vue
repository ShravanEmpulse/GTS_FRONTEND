<template>

  <b-navbar toggleable="md" class="header d-print-none">
    <img src="../../assets/svg/logo_hdg_ver.svg" alt="" height="30" />

    <b-navbar-nav class="navbar-nav-mobile ml-auto">
        <div  class="nav">    
          <div v-for="row in menuList" :key="row.menuId">
            <b-nav-item v-if="Object.keys(row.subMenu).length < 1" class="d-md-down-none" :to="row.menuLinkUrl">
              <i v-if="row.menuId == 1 || row.menuId == 11" class="la la-home" />
              <i v-if="row.menuId == 3 || row.menuId == 8 || row.menuId == 10" class="la la-truck" />
              &nbsp; {{row.menuTitle}}
            </b-nav-item> 

            <b-nav-item-dropdown  v-if="Object.keys(row.subMenu).length >= 1" no-caret right>
              <template slot="button-content">
                <i v-if="row.menuId == 2 || row.menuId == 7 || row.menuId == 9" class="la la-globe" />
                <i v-if="row.menuId == 4" class="la la-paste" />
                <i v-if="row.menuId == 5" class="la la-cog" />
                <i v-if="row.menuId == 6" class="la la-history" />
                &nbsp; {{row.menuTitle}}
              </template>
              <div v-for="sub in row.subMenu" :key="sub.subMenuId">
                <b-dropdown-divider v-if="sub.subMenuLinkUrl == '/app/report/yearlyTrailerSummary'"/>
                <b-dropdown-item :to="sub.subMenuLinkUrl" >  {{sub.subMenuTitle}} </b-dropdown-item>
              </div>
            </b-nav-item-dropdown>
          </div>
        </div>

        <b-nav-item class="d-md-down-none" @click="logout">
          <i class="la la-power-off px-2" />&nbsp;LOGOUT
        </b-nav-item>
      </b-navbar-nav>

      
        <loading
            :show="loadingShow"
            :label="loadingLabel"
            loader-class="loading">
        </loading>
  </b-navbar>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Headed',
  components: {  },
  computed: {
    ...mapState('layout', {
      sidebarClose: state => state.sidebarClose,
      sidebarStatic: state => state.sidebarStatic,
    }),
  },
  created() {
    if(this.$route.params.id == null ){
        this.getMenuList();
    }
  },
  data() {
    return {
      /* LOADING */
      loadingShow: false,
      loadingLabel: 'Loading...',
      showNavbarAlert: true,
      menuList: [],
    }
  },
  methods: {
    ...mapActions('layout', ['toggleSidebar', 'toggleChat', 'switchSidebar', 'changeSidebarActive']),
    switchSidebarMethod() {
      if (!this.sidebarClose) {
        this.switchSidebar(true);
        this.changeSidebarActive(null);
      } else {
        this.switchSidebar(false);
        const paths = this.$route.fullPath.split('/');
        paths.pop();
        this.changeSidebarActive(paths.join('/'));
      }
    },
    logout(){
      window.sessionStorage.clear();
      this.$router.push('/login');
    },
    getMenuList(){
      this.loadingShow = true;
      this.$axios.get('/api/menu/menuList')
      .then((response) => {
          console.log(response);
          this.loadingShow = false;
          this.menuList = response.data.resultBody;
      })
      .catch((ex)=> {
          console.log(ex);
          this.loadingShow = false;
      }) 
    },
  }

};
</script>

<style lang="scss">

  .navbar-light .navbar-nav .nav-link {
    color: #e9ecef  !important;
  }

  .navbar-light .navbar-nav :hover {
    color: #94b5d7 !important;
  }

</style>

<style src="./Header.scss" lang="scss" scoped />
