import { combineReducers } from 'redux';

// import { reducer as session } from './session';

const screenWidthReducer = ( state = 1, action ) => {
  switch( action.type ) {
    case 'SET_SCREENWIDTH':
      return action.screenWidth;
    default: return state;
  }
}

const imagesReducer = ( state = [], action ) => {
  let state_new;
  switch( action.type ) {
    case 'SET_IMAGES':
      return action.images;
    case 'ADD_IMAGE':
      return state.concat(action.image);
    // case 'UPDATE_PLACEHOLDER':
    //   state_new = state.slice();
    //   state_new.find(image => image.id == action.id).placeHolder = action.placeHolder;
    //   return state_new;
    case 'UPDATE_ICONINFO':
      state_new = state.slice();
      state_new.find(image => image.id == action.id).iconInfo = action.iconInfo;
      return state_new;
    case 'DELETE_IMAGE':
      state_new = state.slice();
      state_new = state_new.filter(image => image.id != action.id);
      return state_new;
    case 'SELECT_ICON':
      state_new = state.slice();
      if(state_new.find(image => image.id == action.id).iconSelected == action.iconId) {
        state_new.find(image => image.id == action.id).iconSelected = -1;
        state_new.find(image => image.id == action.id).iconInfo = null;
      }
      else state_new.find(image => image.id == action.id).iconSelected = action.iconId;
      return state_new;
    case 'UNSELECT_ICON':
      state_new = state.slice();
      state_new.find(image => image.id == action.id).iconSelected = -1;
      state_new.find(image => image.id == action.id).iconInfo = null;
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

const imageIdReducer = ( state = 0, action ) => {
  switch( action.type ) {
    case 'UPDATE_ID':
      return action.id;
    default: return state;
  }
}

const iconIdReducer = ( state = 0, action ) => {
  switch( action.type ) {
    case 'UPDATE_ICON_ID':
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

const reducers = combineReducers({
  default: () => [],

  screenWidth: screenWidthReducer,

  images: imagesReducer,
  imageSelected: imageSelectedReducer,
  imageId: imageIdReducer,

  icons: iconsReducer,
  iconSelected: iconSelectedReducer,
  iconId: iconIdReducer,

  screen: screenReducer,

});

export default reducers;
