import {
  all,
  put,
  takeLatest,
} from 'redux-saga/effects';

import store from '../';


export default function* rootSaga() {
  
  yield all([
    // takeLatest('ADD_IMAGE', AddImageAction),
  ]);
}

function* AddImageAction(action) {
  
  let image = action.image;
  image.order = store.getState().images.length;
  // store.dispatch({type:'ADD_IMAGE_ORDER'});

  console.log(image);
  
  yield put({
    type: 'ADD_IMAGE_FINISH',
    image:image
  });
}


