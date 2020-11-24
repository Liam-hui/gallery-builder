import api from './api';
import store from '../store';

const status = () => store.getState().status;

export const Services = {
  get,
  adminUploadPhoto,
  adminGetAlbumPhotos,
  adminDeletePhoto,
  adminUpdatePhotos,
  userGetPhotos,
  userUploadIcon,
  userUpdatePhotos,
  titleToImage,
};

//get
function get(url,set) {
  api.get(url, {
  })
  .then((response) => {
    if(response.data.message=='Success') {
      if(set)set(response.data.data);
      // console.log(response.data.data.data);
    }
    // else if(errorFunc)errorFunc();
  }, (error) => {
    console.log(error);
    // if(errorFunc)errorFunc();
  });
}

function adminGetAlbumPhotos(product_id) {
  api.get('album/admin/currentEditing/'+product_id,{
  })
  .then((response) => {
    console.log(response.data.data);
    for (const [id, photo] of Object.entries(response.data.data)) {

      let iconInfo = {
        size: photo.details.size,
        x: photo.details.position[0],
        y: photo.details.position[1],
        rot: photo.details.rotate,
      }

      let textInfo = null;
      if(photo.details.title!=null){
        textInfo = {
          height:photo.details.title.size[0],
          width:photo.details.title.size[1],
          scaleX:1,
          scaleY:1,
          scale:1,
          x:photo.details.title.position[0],
          y:photo.details.title.position[1],
          rot:photo.details.title.rotate,
        }
      }

      let image = new Image();
      image.onload = function () {
        store.dispatch({type:'ADD_IMAGE',image:{url:this.src,height:this.height,width:this.width,id:id,iconInfo:iconInfo,textInfo:textInfo}})
      };
      image.src = photo.img_base64;
    }
  }, (error) => {
    console.log(error);
  });
}

function adminUploadPhoto(photo) {
  let body = {
    "product":status().product_id,
    "photos":[
      {
        "type":"new",
        "id":Math.random().toString(36).substr(2, 9),
        "photo_details":{
          "position":[0,0],
          "size":[300,300],
          "rotate":0,
        },
        "img_base64":photo.base64,
      }
    ],
  }
  api.post('album/adminAddPhoto', body,{
  })
  .then((response) => {
    if (response.data.message=='Success') store.dispatch({type:'ADD_IMAGE',image:{url:photo.base64,height:photo.height,width:photo.width,id:Math.random().toString(36).substr(2, 9)}})
  }, (error) => {
    console.log(error);
  });
}

function adminDeletePhoto(photo_id,deleteImage) {
  let body = {
    "product":status().product_id,
    "photos": [
      {
        "type":"delete",
        "id":photo_id,
      }
    ]
  }
  api.post('album/adminAddPhoto', body,{
  })
  .then((response) => {
    if (response.data.message=='Success') deleteImage();
  }, (error) => {
    console.log(error);
  });
}

function adminUpdatePhotos(photos) {
  console.log(photos);
  photos = photos.map(photo=>{ 
    let photoData = {
      "type":"update",
      "id":photo.id,
      "photo_details":{
        "position":[photo.iconInfo.x,photo.iconInfo.y],
        "size":[photo.iconInfo.height*photo.iconInfo.scale,photo.iconInfo.width*photo.iconInfo.scale],
        "rotate":photo.iconInfo.rot,
      }
    }
    if(photo.textInfo!=null) photoData.photo_details.title = {
      "title":"test",
      "position":[photo.textInfo.x,photo.textInfo.y],
      "size":[photo.textInfo.height*photo.textInfo.scale*photo.textInfo.scaleY,photo.textInfo.width*photo.textInfo.scale*photo.textInfo.scaleX],
      "rotate":photo.textInfo.rot,
      "color":'#000000',
    }
    return photoData;
  });
  let body = {
    "product":status().product_id,
    "photos":photos,
  }
  // api.post('album/adminAddPhoto', body,{
  // })
  // .then((response) => {
  //   console.log(response.data);
  // }, (error) => {
  //   console.log(error);
  // });
}

function userGetPhotos(order_id,product_id) {
  api.get('album/customer/customerCurrentEditing/'+order_id,{
  })
  .then((response) => {
    // console.log(response.data.data.photo_details[product_id]);
    for (const [id, photo] of Object.entries(response.data.data.photo_details[product_id])) {

      let textInfo = {
      };

      let placeHolder = {
        size: photo.details.details.size,
        x: photo.details.details.position[0],
        y: photo.details.details.position[1],
        rot: photo.details.details.rotate,
      }

      let image = new Image();
      image.onload = function () {
        store.dispatch({type:'ADD_IMAGE',image:{url:this.src,height:this.height,width:this.width,id:id,textInfo:textInfo,placeHolder:placeHolder}})
      };
      image.src = photo.img_base64;
    }
  }, (error) => {
    console.log(error);
  });
}


function userUploadIcon(icon) {
  let body = {
    "customer":status().customer_id,
    "img_base64":icon.base64
  }
  api.post('customer/saveCustomerPhoto', body,{
  })
  .then((response) => {
    if (response.data.message=='Success') {
      let image = new Image();
      image.onload = function () {
        store.dispatch({type:'ADD_ICON',icon:{url:this.src,height:this.height,width:this.width,id:response.data.data.img_uuid}});
      };
      image.src = response.data.data.img_base64;
    }
  }, (error) => {
    console.log(error);
  });
}

function userUpdatePhotos(photos) {
  let photoDetails = {};
  photos.forEach(photo=>{
    if(photo.iconInfo!=null) photoDetails[photo.id] = {
      "details": {
        "photo":photo.iconSelected,
        "position":[photo.iconInfo.x,photo.iconInfo.y],
        "size":[photo.iconInfo.height*photo.iconInfo.scale,photo.iconInfo.width*photo.iconInfo.scale],
        "rotate":photo.iconInfo.rot,
        // "title":{ 
        //   "title":"title",
        //   "position":[x,y],
        //   "size":"font_size_in_PX",
        //   "color":"color_code_in_hex",
        // },
      },
    }
  })
  let body = {
    "product":status().product_id,
    "customer":status().customer_id,
    "order":"d8f5ca96-a092-4250-a8fa-1dc1b96b22d4",
    "confirm":0,
    "photo_details": photoDetails,
  }
  // let body = {
  //   "product":5898975314070,
  //   "customer":"4375608950934",
  //   "order":"d8f5ca96-a092-4250-a8fa-1dc1b96b22d4",
  //   "confirm":0,
  //   "photo_details":{
  //       "6762754f-9b83-4dc4-8dba-65f143c43fc1":{
  //           "details": {
  //               "position":[0,0],
  //               "size":[100,100],
  //               "rotate":0
  //           }
  //       }
  //   }
  // }
  api.post('album/customerUpdatePhoto', body,{
  })
  .then((response) => {
    console.log(response.data);
  }, (error) => {
    console.log(error);
  });
}

function titleToImage(photo_id,titleText) {
  let body = {
    "customer":null,
    "photo_uuid":photo_id,
    "title":titleText,
    "mode":1
}
  api.post('album/textToImg', body,{
  })
  .then((response) => {
    console.log(response.data);
    if (response.data.message=='Success') {
      let image = new Image();
      image.onload = function () {
        store.dispatch({type:'ADD_TITLE_IMAGE',id:photo_id,image:{url:this.src,height:this.height,width:this.width}});
      };
      image.src = 'data:image/jpg;base64,'+response.data.data.img_base64;
    }
  }, (error) => {
    console.log(error);
  });
}
