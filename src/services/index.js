import api from './api';
import store from '../store';

const status = () => store.getState().status;

export const Services = {
  get,
  adminUploadPhoto,
  adminGetAlbumPhotos,
  adminDeletePhoto,
  adminUpdatePhotos,
  adminUpdatePhotoOrder,
  userGetPhotos,
  userUploadIcon,
  userUpdatePhotos,
  titleToImage,
  realText,
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
    if(error&&error.response) console.log(error.response.data);
    // if(errorFunc)errorFunc();
  });
}

function adminGetAlbumPhotos(product_id) {
  api.get('album/admin/currentEditing/'+product_id,{
  })
  .then((response) => {
    console.log(response.data.data);
    store.dispatch({type:'CLOSE_OVERLAY'});
    for (const [id, photo] of Object.entries(response.data.data)) {

      let iconInfo = {
        size: photo.details.size,
        x: photo.details.position[0],
        y: photo.details.position[1],
        rot: photo.details.rotate,
        scale:1,
        height:photo.details.size[0],
        width:photo.details.size[1],
      }

      let textInfo = null;
      if(photo.details.title!=null){
        textInfo = {
          title:photo.details.title.title,
          height:photo.details.title.size[0],
          width:photo.details.title.size[1],
          scale:1,
          x:photo.details.title.position[0],
          y:photo.details.title.position[1],
          rot:photo.details.title.rotate,
          color:photo.details.title.color,
        }
      }

      let image = new Image();
      image.onload = function () {
        store.dispatch({type:'ADD_IMAGE',image:{url:this.src,height:this.height,width:this.width,id:id,iconInfo:iconInfo,textInfo:textInfo,order:photo.sequence}});  
        if(photo.details.title!=null&&photo.details.title.title!='') titleToImage(id,photo.details.title.title);
      };
      image.src = photo.img_base64;
    }
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
    store.dispatch({type:'CLOSE_OVERLAY'});
  });
}

function adminUploadPhoto(photo) {
  let temp_id = Math.random().toString(36).substr(2, 9);
  let size = Math.max(photo.width,photo.height)*0.2;
  let body = {
    "product":status().product_id,
    "photos":[
      {
        "type":"new",
        "id":temp_id,
        "sequence":photo.order,
        "photo_details":{
          "position":[photo.width*0.5,photo.height*0.5],
          "size":[size,size],
          "rotate":0,
        },
        "img_base64":photo.base64,
      }
    ],
  }

  let iconInfo = {
    size: [size,size],
    height:size,
    width:size,
    x: photo.width*0.5,
    y: photo.height*0.5,
    rot: 0,
    scale:1,
  }

  api.post('album/adminAddPhoto', body,{
  })
  .then((response) => {
    if (response.data.message=='Success') {
      store.dispatch({type:'UPDATE_IMAGE',image:{url:photo.base64,height:photo.height,width:photo.width,id:response.data.data[temp_id],iconInfo:iconInfo,order:photo.order}})
    }
  }, (error) => {
    if(error&&error.response) {
      console.log(error.response.data);
      store.dispatch({type:'DELETE_IMAGE_ORDER',order:photo.order});
    }
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
    if (response.data.message=='Success') {
      deleteImage();
    }
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
  });
}

function adminUpdatePhotoOrder(photo_id,newOrder,product_id) {
  let body = {
    "product":product_id,
    "photo_uuid":photo_id,
    "sequence":newOrder
  }
  api.post('album/updateAlbumPhotoSequence', body,{
  })
  .then((response) => {
    if (response.data.message=='Success') {      
    }
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
  });
}

function adminUpdatePhotos(photos,after,color) {
  console.log(photos);
  photos = photos.sort((a,b) => a.order - b.order).map(photo=>{ 
    let photoData = {
      "type":"update",
      "id":photo.id,
      "sequence":photo.order,
      "photo_details":{
        "position":[photo.iconInfo.x,photo.iconInfo.y],
        "size":[photo.iconInfo.height*photo.iconInfo.scale,photo.iconInfo.width*photo.iconInfo.scale],
        "rotate":photo.iconInfo.rot,
      }
    }
    if(photo.textInfo!=null) {
      photoData.photo_details.title = {
        "title":photo.textTitle,
        "position":[photo.textInfo.x,photo.textInfo.y],
        "size":[photo.textInfo.height*photo.textInfo.scale,photo.textInfo.width*photo.textInfo.scale],
        "rotate":photo.textInfo.rot,
      }
      if(color) {
        photoData.photo_details.title.color = color;
        store.dispatch({type:'UPDATE_COLOR',id:photo.id,color:color});
      }
    }
    return photoData;
  });
  let body = {
    "product":status().product_id,
    "photos":photos,
  }
  api.post('album/adminAddPhoto', body,{
  })
  .then((response) => {
    console.log(response.data);
    if(after) after();
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
  });
}

function userGetPhotos(order_id,product_id,demo) {
  api.get('album/customer/customerCurrentEditing/'+order_id,{
  })
  .then((response) => {
    console.log(response.data.data);
    store.dispatch({type:'CLOSE_OVERLAY'});
    for (const [id, photo] of Object.entries(response.data.data.photo_details[product_id])) {

      let textInfo = null;
      if(photo.details.title!=null){
        textInfo = {
          adminTitle:photo.admin_title,
          // adminTitle:"This is {**Customer_INPUT**}'s Album",
          title:photo.details.title.title,
          height:photo.details.title.size[0],
          width:photo.details.title.size[1],
          scale:1,
          x:photo.details.title.position[0],
          y:photo.details.title.position[1],
          rot:photo.details.title.rotate,
        }
      }

      let iconInfo = {
        size: photo.details.size,
        width: photo.details.size[1],
        height: photo.details.size[0],
        x: photo.details.position[0],
        y: photo.details.position[1],
        rot: photo.details.rotate,
        scale:1,
      }

      let image = new Image();
      image.onload = function () {
        store.dispatch({type:'ADD_IMAGE',image:{url:this.src,height:this.height,width:this.width,id:id,textInfo:textInfo,iconInfo:iconInfo,order:photo.details.sequence}})
        
        if (photo.details.title!=null&&photo.details.title.title!=null) store.dispatch({type:'ADD_TITLE_IMAGE',id:id,image:{url:'data:image/jpg;base64,'+photo.details.title.title}});
        else if(photo.admin_title!=null&&photo.admin_title!='') titleToImage(id,photo.admin_title);

        if(photo.details.photo!=null) userSelectIcon(photo.details.photo,photo.image_uuids.photo,id);
    
      };
      image.src = photo.img_base64;
    }
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
    store.dispatch({type:'CLOSE_OVERLAY'});
  });
}

function userSelectIcon(icon_base64,icon_id,photo_id){
  let image = new Image();
  image.onload = function () {
    if(!store.getState().icons.some(x=>x.id==icon_id)) store.dispatch({type:'ADD_ICON',icon:{url:this.src,height:this.height,width:this.width,id:icon_id}});
    store.dispatch({type:'SELECT_ICON',iconId:icon_id,id:photo_id});
  };
  image.src = 'data:image/jpg;base64,' + icon_base64;
}

function userUploadIcon(icon,original) {
  let body = {
    "customer":status().customer_id,
    "img_base64":icon.base64,
    "isTest":0,
    "useOriginal":original,
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
      store.dispatch({type:'CLOSE_OVERLAY'});
    }
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
    store.dispatch({type:'SET_OVERLAY',mode:'uploadFail'});
  });
}

function userUpdatePhotos(photos,confirm) {
  let photoDetails = {};
  photos.forEach(photo=>{
    if(photo.iconInfo!=null&&photo.iconSelected!=null) {
      photoDetails[photo.id] = {
        "details": {
          "photo":photo.iconSelected,
          "position":[photo.iconInfo.x,photo.iconInfo.y],
          "size":[photo.iconInfo.height*photo.iconInfo.scale,photo.iconInfo.width*photo.iconInfo.scale],
          "rotate":photo.iconInfo.rot,
        },
      }
      if(photo.textImage&&photo.textImage.id) photoDetails[photo.id].details.title = {
        "title":photo.textImage.id,
      }
    }
  })
  let body = {
    "product":status().product_id,
    "customer":status().customer_id,
    "order":status().order_id,
    "confirm":confirm,
    "photo_details": photoDetails,
  }

  console.log(JSON.stringify(body));
  api.post('album/customerUpdatePhoto', body,{
  })
  .then((response) => {
    console.log(response.data);
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
  });
}

function titleToImage(photo_id,titleText,finishLoad) {
 
  let real_text = titleText;
  real_text = realText(titleText,'Customer');

  let body = {
    "customer":status().mode=='user'?status().customer_id:null,
    "photo_uuid":photo_id,
    "title":real_text,
    "mode":status().mode=='admin'?1:2,
  }
  api.post('album/textToImg', body,{
  })
  .then((response) => {
    console.log(response.data.data.img_uuid);
    if (response.data.message=='Success') {
      let image_base64 = 'data:image/jpg;base64,'+response.data.data.img_base64;
      if(status().mode=='admin'){
        store.dispatch({type:'ADD_TITLE_IMAGE',id:photo_id,title:titleText,image:{url:image_base64}});
        adminUpdatePhotos([store.getState().images.find(image => image.id == photo_id)]);
      }
      else if (status().mode=='user')store.dispatch({type:'ADD_TITLE_IMAGE',id:photo_id,title:titleText,image:{id:response.data.data.img_uuid,url:image_base64}});
      if(finishLoad)finishLoad();
    }
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
    if(finishLoad)finishLoad();
  });
}

function realText(titleText,subText) {
  let customer_text = '{**Customer_INPUT**}';
  let start_pos = titleText.indexOf(customer_text);
  let end_pos = start_pos + customer_text.length;

  if(start_pos==-1) return titleText;
  else return titleText.substr(0,start_pos) + subText + titleText.substr(end_pos,titleText.length-end_pos);
}
