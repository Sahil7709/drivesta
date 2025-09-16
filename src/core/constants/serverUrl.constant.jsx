class ServerUrl {
    
    // Base URL
    // static REACT_APP_API_URL = "http://localhost:3000/api"
    // static IMAGE_URL = "http://localhost:3000"
    static REACT_APP_API_URL = "https://api.carnomia.com/api/"
    static IMAGE_URL = "https://api.carnomia.com"
    // static REACT_APP_API_URL = "http://31.97.231.187:3000/api"


    static API_MODULE_USER = "/user";
    static API_LOGIN = ServerUrl.API_MODULE_USER + "/login";
    static API_REGISTER = ServerUrl.API_MODULE_USER + "/register";
    static API_VERIFY_OTP = ServerUrl.API_MODULE_USER + "/login";
    static API_UPDATE_USER = ServerUrl.API_MODULE_USER + "/update";    
    static API_GET_ALL_USERS_BY_ROLES = ServerUrl.API_MODULE_USER + "/getUsersByRoles";  
    static API_DELETE_USER = ServerUrl.API_MODULE_USER + "/delete";

    static API_MODULE_META = "/meta";    
    static API_ADD_VEHICLE = ServerUrl.API_MODULE_META + "/Vehicle";
    static API_GET_VEHICLES = ServerUrl.API_MODULE_META + "/getallvehicle";
    static API_UPDATE_VEHICLES = ServerUrl.API_MODULE_META + "/updateVehicle";
    static API_DELETE_VEHICLES = ServerUrl.API_MODULE_META + "/deleteVehicle";

    static API_ADD_LOCATIONS = ServerUrl.API_MODULE_META + "/createLocations";
    static API_GET_LOCATIONS = ServerUrl.API_MODULE_META + "/getLocations";
    static API_UPDATE_LOCATIONS = ServerUrl.API_MODULE_META + "/updateLocations";
    static API_DELETE_LOCATIONS = ServerUrl.API_MODULE_META + "/deleteLocations";
    static API_ADD_INQUIRY = ServerUrl.API_MODULE_META + "/submit-inquiry";

  

    static API_MODULE_COMMON = "/common";    
    static API_UPLOAD_IMAGE = ServerUrl.API_MODULE_COMMON + "/upload";

    static API_MODULE_PDI = "/pdi";
    static API_PDI_CREATE = ServerUrl.API_MODULE_PDI + "/create";
    static API_GET_ALLPDIREQUEST = ServerUrl.API_MODULE_PDI + "/request";
    static API_GET_REQUEST_BY_ID = ServerUrl.API_MODULE_PDI + "/request-by-id";
    static API_GET_INSPECTION_UPDATE = ServerUrl.API_MODULE_PDI + "/request/updateInspectionById";
    static API_GET_INSPECTION_DELETE = ServerUrl.API_MODULE_PDI + "/request/deleteInspectionById";
    static API_GET_ALL_REQUESTS_BY_ENGINEER = ServerUrl.API_MODULE_PDI + "/request-by-engineer";
    static API_ASSIGN_ENGINEER = ServerUrl.API_MODULE_PDI + "/request/assign";
    static API_WITHVEHICLE_DATA = ServerUrl.API_MODULE_PDI + "/PDIRequestwithvehicledata";
    static API_GET_REQUEST_COUNT = ServerUrl.API_MODULE_PDI + "/requests/requests-count";
    static API_GET_RECENT_REQUEST_BY_CUSTOMER = ServerUrl.API_MODULE_PDI + "/customer/recent";
    static API_GET_ALL_PDIREQUEST_STATUSES = ServerUrl.API_MODULE_PDI + "/requests/statuses";
    static API_UPDATE_PAYMENT_STATUS = ServerUrl.API_MODULE_PDI + "/request/payment-status";

}
export default ServerUrl;
