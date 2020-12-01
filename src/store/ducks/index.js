import { combineReducers } from 'redux';
import {Services} from '../../services';

const initialStep = {
  current:1,
  store:[
    {object:'headObject',objectInfo:null},
    {object:'textObject',objectInfo:null}
  ]
}

const imagesReducer = ( state = [], action ) => {
  let state_new = state.slice();
  switch( action.type ) {
    case 'SET_IMAGES':
      return action.images;
    case 'ADD_IMAGE':
      return state.concat( {...action.image,  ...{step: Object.assign({}, initialStep)}}); 
    case 'ADD_IMAGE_START':
      console.log('start');
      return state.concat( {...action.image,  ...{loading:true}}); 
    case 'ADD_IMAGE_SUCCESS':
      state_new[state_new.findIndex(image => image.order == action.image.order)] = {...action.image,  ...{step: Object.assign({}, initialStep),loading: false}};
      return state_new;
    case 'ADD_IMAGE_FAIL':
      state_new.forEach(image => {
        if(image.order>action.order) {
          image.order -=1;
          if(image.id)Services.adminUpdatePhotoOrder(image.id,image.order,action.product_id);
        }
      });
      state_new = state_new.filter(image => image.order != action.order);
      return state_new;
    case 'UPDATE_STEP':
      state_new.find(image => image.id == action.id).step = action.step;
      return state_new;
    case 'UPDATE_ICONINFO':
      state_new.find(image => image.id == action.id).iconInfo = {...state_new.find(image => image.id == action.id).iconInfo,  ...action.iconInfo };
      return state_new;
    case 'UPDATE_TEXTINFO':
      state_new.find(image => image.id == action.id).textInfo = {...state_new.find(image => image.id == action.id).textInfo,  ...action.textInfo };
      return state_new;
    case 'UPDATE_COLOR':
      state_new.find(image => image.id == action.id).textInfo.color = action.color;
      return state_new;
    case 'REMOVE_TEXT':
      state_new.find(image => image.id == action.id).textInfo = null;
      state_new.find(image => image.id == action.id).textImage = null;
      state_new.find(image => image.id == action.id).textTitle = null;
      return state_new;
    case 'TITLE_IMAGE_LOADING':
      state_new.find(image => image.id == action.id).textLoading = true;
      return state_new;
    case 'TITLE_IMAGE_LOADING_END':
      state_new.find(image => image.id == action.id).textLoading = false;
      return state_new;
    case 'ADD_TITLE_IMAGE':
      state_new.find(image => image.id == action.id).textLoading = false;
      state_new.find(image => image.id == action.id).textImage = action.image;
      state_new.find(image => image.id == action.id).textTitle = action.title;
      return state_new;
    case 'DELETE_IMAGE_START':
      state_new.find(image => image.id == action.id).deleting = true;
      return state_new;
    case 'DELETE_IMAGE_SUCCESS':
      let order = state_new.find(image => image.id == action.id).order;
      state_new.forEach(image => {
        if(image.order>order) {
          image.order -=1;
          Services.adminUpdatePhotoOrder(image.id,image.order,action.product_id);
        }
      });
      state_new = state_new.filter(image => image.id != action.id);
      return state_new;
    case 'DELETE_IMAGE_FAIL':
      state_new.find(image => image.id == action.id).deleting = false;
      return state_new;
    case 'SELECT_ICON':
      state_new = state.slice();
      if(state_new.find(image => image.id == action.id).iconSelected == action.iconId) {
        state_new.find(image => image.id == action.id).iconSelected = -1;
      }
      else state_new.find(image => image.id == action.id).iconSelected = action.iconId;
      state_new.find(image => image.id == action.id).step = Object.assign({}, initialStep);
      return state_new;
    case 'UNSELECT_ICON':
      state_new = state.slice();
      state_new.find(image => image.id == action.id).iconSelected = -1;
      state_new.find(image => image.id == action.id).step = Object.assign({}, initialStep);
      return state_new;
    case 'CHANGE_ORDER':
      state_new = state.slice();
      let old_order = state_new.find(image => image.id == action.id).order;
      let new_order = old_order + action.change;
      state_new.forEach(image => {
        if(action.change>0&&image.order<=new_order&&image.order>old_order) {
          image.order -=1;
          Services.adminUpdatePhotoOrder(image.id,image.order,action.product_id);
        }
        else if(action.change<0&&image.order>=new_order&&image.order<old_order) {
          image.order +=1;
          Services.adminUpdatePhotoOrder(image.id,image.order,action.product_id);
        }
      });
      state_new.find(image => image.id == action.id).order = new_order;
      Services.adminUpdatePhotoOrder(action.id,new_order,action.product_id);
      return state_new;
    default: return state;
  }
}

const imageSelectedReducer = ( state = -1, action ) => {
  switch( action.type ) {
    case 'SELECT_IMAGE':
      return action.id;
    default: return state;
  }
}

const iconsReducer = ( state = [], action ) => {
  let state_new = state.slice();
  switch( action.type ) {
    case 'ADD_ICON':
      return state.concat(action.icon);
    case 'ADD_ICON_START':
      return state.concat( {...action.icon,  ...{loading:true}}); 
    case 'ADD_ICON_SUCCESS':
      state_new[state.length-1] = {...action.icon,  ...{loading: false}};
      return state_new;
    case 'ADD_ICON_FAIL':
      return state.slice(0,state.length-1)
    case 'DELETE_ICON_START':
      state_new.find(icon => icon.id == action.id).deleting = true;
      return state_new;
    case 'DELETE_ICON_SUCCESS':
      return state.filter(icon => icon.id != action.id);
    case 'DELETE_ICON_FAIL':
      state_new.find(icon => icon.id == action.id).deleting = false;
      return state_new;
    default: return state;
  }
}

const iconSelectedReducer = ( state = -1, action ) => {
  switch( action.type ) {
    case 'SELECT_ICON':
      if (state == action.iconId) return -1;
      else return action.iconId;
      
    default: return state;
  }
}

const screenReducer = ( state = {}, action ) => {
  switch( action.type ) {
    case 'SET_SCREEN':
      return {screenWidth:action.screenWidth,screenHeight:action.screenHeight,orientation:action.orientation};
      
    default: return state;
  }
}

const displayReducer = ( state = null, action ) => {
  switch( action.type ) {
    case 'SET_DISPLAY':
      return action.display;
      
    default: return state;
  }
}

const statusReducer = ( state = {mode:null}, action ) => {
  switch( action.type ) {
    case 'SET_STATUS':
      return action.status;
      
    default: return state;
  }
}

const overlayReducer = ( state = {on:'on',mode:'loading'}, action ) => {
  switch( action.type ) {
    case 'SET_OVERLAY':
      return {on:'on',mode:action.mode};
    case 'HIDE_OVERLAY':
      return {on:'hidden',mode:state.mode};
    case 'OFF_OVERLAY':
      return {on:'off',mode:null};
    default: return state;
  }
}

const reducers = combineReducers({
  default: () => [],

  images: imagesReducer,
  imageSelected: imageSelectedReducer,

  icons: iconsReducer,
  iconSelected: iconSelectedReducer,

  screen: screenReducer,

  display: displayReducer,

  status: statusReducer,

  overlay: overlayReducer,

});

export default reducers;
