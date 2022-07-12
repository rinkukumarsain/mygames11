const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let andriodVersion = new Schema({
  version: {
    type: Number,
    default: 1,
  },
  updation_points: {
    type: String,
    default: '<p>My Game 11</p>',
  },
});

let general_tabs = new Schema({
  type: {
    type: String,
  },
  amount: {
    type: Number,
  },
});

let sidebanner = new Schema({
  type: {
    type: String,
  },
  bannerType: {
    type: String,
  },
  image: {
    type: String,
  },
  url: {
    type: String,
  },
});

let permissions = new Schema({
  settings_manager: { type: Array },
  series_manager: { type: Array },
  teams_manager: { type: Array },
  player_manager: { type: Array },
  upcoming_matches: { type: Array },
  all_matches: { type: Array },
  update_playing_xi: { type: Array },
  user_manager: { type: Array },
  verify_manager: { type: Array },
  received_fund: { type: Array },
  notifications: { type: Array },
  contest_full_detail: { type: Array },
  contest_catagory_manager: { type: Array },
  global_contest: { type: Array },
  custom_contest: { type: Array },
  import_leauge_in_contest: { type: Array },
  results: { type: Array },
  banner: { type: Array },
  profit_loss_manager: { type: Array },
  bot_user_manager: { type: Array },
  general_tab_manager: { type: Array },
  add_point_manager: { type: Array },
  product_manager: { type: Array },
  pass_manager: { type: Array },
  offers_manager: { type: Array },
  youtuber_manager: { type: Array },
  point_system_manager: { type: Array },
  popup_notify_manager: { type: Array }
});

let adminSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    mobile: {
      type: String,
      default: '',
    },
    image: {
      default: '',
      type: String,
    },
    role: {
      type: String,
      default: '0',
    },
    permissions: permissions,
    remember_token: {
      type: String,
      default: '',
    },
    masterpassword: {
      type: String,
      default: '',
    },
    androidversion: andriodVersion,
    general_tabs: [general_tabs],
    sidebanner: [sidebanner],
    popup_notify_image:{
      type:String,
      default:''
    },
    popup_notify_title:{
      type:String,
      default:''
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
module.exports = mongoose.model('admin', adminSchema);
