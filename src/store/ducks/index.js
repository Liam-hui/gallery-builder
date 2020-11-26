import { combineReducers } from 'redux';

// import { reducer as session } from './session';

const initialStep = {
  current:1,
  store:[
    {object:'headObject',objectInfo:null},
    {object:'textObject',objectInfo:null}
  ]
}

const imagesReducer = ( state = [], action ) => {
  let state_new;
  switch( action.type ) {
    case 'SET_IMAGES':
      return action.images;
    case 'ADD_IMAGE_FINISH':
      return state.concat( {...action.image,  ...{step: Object.assign({}, initialStep)}}); 
    case 'UPDATE_STEP':
      state_new = state.slice();
      state_new.find(image => image.id == action.id).step = action.step;
      return state_new;
    case 'UPDATE_ICONINFO':
      state_new = state.slice();
      state_new.find(image => image.id == action.id).iconInfo = action.iconInfo;
      return state_new;
    case 'UPDATE_TEXTINFO':
      state_new = state.slice();
      state_new.find(image => image.id == action.id).textInfo = {...state_new.find(image => image.id == action.id).textInfo,  ...action.textInfo };
      return state_new;
    case 'UPDATE_COLOR':
      state_new = state.slice();
      state_new.find(image => image.id == action.id).textInfo.color = action.color;
      return state_new;
    case 'REMOVE_TEXT':
      state_new = state.slice();
      state_new.find(image => image.id == action.id).textInfo = null;
      state_new.find(image => image.id == action.id).textImage = null;
      state_new.find(image => image.id == action.id).textTitle = null;
      return state_new;
    case 'ADD_TITLE_IMAGE':
      state_new = state.slice();
      state_new.find(image => image.id == action.id).textImage = action.image;
      state_new.find(image => image.id == action.id).textTitle = action.title;
      return state_new;
    case 'DELETE_IMAGE':
      state_new = state.slice();
      state_new = state_new.filter(image => image.id != action.id);
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
        if(action.change>0&&image.order<=new_order&&image.order>old_order) image.order -=1;
        else if(action.change<0&&image.order>=new_order&&image.order<old_order) image.order +=1;
      });
      state_new.find(image => image.id == action.id).order = new_order;
      return state_new;
    default: return state;
  }
}

const imageOrderReducer = ( state = 0, action ) => {
  switch( action.type ) {
    case 'ADD_IMAGE_ORDER':
      return state+1;
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
  switch( action.type ) {
    case 'ADD_ICON':
      return state.concat(action.icon);
    case 'DELETE_ICON':
      let state_new_ = state.slice();
      state_new_ = state_new_.filter(icon => icon.id != action.id);
      return state_new_;
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

const loadingReducer = ( state = false, action ) => {
  switch( action.type ) {
    case 'LOADING_START':
      return true;
    case 'LOADING_END':
      return false;
    default: return state;
  }
}

const overlayReducer = ( state = null, action ) => {
  switch( action.type ) {
    case 'SET_OVERLAY':
      return action.mode;
    case 'CLOSE_OVERLAY':
      return null;
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

  loading: loadingReducer,

  overlay: overlayReducer,

  imageOrder:imageOrderReducer,

});

export default reducers;
