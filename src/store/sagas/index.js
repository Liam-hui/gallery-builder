import {
  all,
  put,
  takeLatest,
} from 'redux-saga/effects';

import store from '../';


export default function* rootSaga() {
  
  yield all([
    takeLatest('CLOSE_OVERLAY', closeOverlayAction),
    takeLatest('DELETE_IMAGE_SUCCESS', deleteImageAction),
  ]);
}

function* closeOverlayAction(action) {
  
  store.dispatch({type:'HIDE_OVERLAY'});
  setTimeout(()=>store.dispatch({type:'OFF_OVERLAY'}),500)

  
  yield put({
    type: 'CLOSE_OVERLAY_FINISH',
    // image:image
  });
}

function* deleteImageAction(action) {

  store.dispatch({type:'LOCK_SLIDER'});
  setTimeout(()=>store.dispatch({type:'UNLOCK_SLIDER'}),500)

  
  yield put({
    type: 'DELETE_IMAGE_FINISH',
    // image:image
  });
}


