import api from './api';
import store from '../store';

const status = () => store.getState().status;

export const Services = {
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
  demoGetPhoto,
};

function adminGetAlbumPhotos(product_id) {
  api.get('album/admin/currentEditing/'+product_id,{
  })
  .then(async (response) => {
    console.log(response.data.data);
    // store.dispatch({type:'INIT_IMAGES',count:Object.entries(response.data.data).length});
    store.dispatch({type:'CLOSE_OVERLAY'});
    for (const [id, photo] of Object.entries(response.data.data)) {
      let temp_id = Math.random().toString(36).substr(2, 9);
      if(photo.sequence>-1){

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

        store.dispatch({type:'ADD_IMAGE_START',image:{id:temp_id,order:photo.sequence,loading:true}});

        let image = new Image();
        image.onload = function () {
          store.dispatch({type:'ADD_IMAGE_SUCCESS',ori_id:temp_id,image:{url:this.src,height:this.height,width:this.width,id:id,iconInfo:iconInfo,textInfo:textInfo,order:photo.sequence}});  
          if(photo.details.title!=null&&photo.details.title.title!='') titleToImage(id,photo.details.title.title);
        };

        let getPhotoBase64 = await api.get('album/getPhotoBase64/base/'+id);
        let img_base64 = getPhotoBase64.data.data;

        if(img_base64!=null) image.src = img_base64;
      }
    }
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
    // store.dispatch({type:'INIT_DONE'});
    store.dispatch({type:'CLOSE_OVERLAY'});
  });
}

function adminUploadPhoto(photo) {
  let size = Math.max(photo.width,photo.height)*0.2;
  let body = {
    "product":status().product_id,
    "photos":[
      {
        "type":"new",
        "id":photo.id,
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
    console.log(response.data.data);
    if (response.data.status==200) {
      store.dispatch({type:'ADD_IMAGE_SUCCESS',ori_id:photo.id,image:{url:photo.base64,height:photo.height,width:photo.width,id:response.data.data[photo.id],iconInfo:iconInfo,order:photo.order}})
    }
  }, (error) => {
    if(error&&error.response) {
      console.log(error.response.data);
      store.dispatch({type:'ADD_IMAGE_FAIL',order:photo.order});
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
    if (response.data.status==200) {
      deleteImage();
    }
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
    store.dispatch({type:'DELETE_IMAGE_FAIL',id:photo_id});
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
    console.log(response.data.data);
    if (response.data.status==200) {    
    }
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
  });
}

function adminUpdatePhotos(photos,after,color,save) {
  console.log(photos);
  // photos = photos.sort((a,b) => a.order - b.order)
  photos = photos.filter(x=>!x.loading).map(photo=>{ 
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
    if(save) store.dispatch({type:'SET_OVERLAY',mode:'message',message:response.data.message,cancel:true});
    if(after) after();
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
    if(save) store.dispatch({type:'SET_OVERLAY',mode:'message',message:error.response.data.message,cancel:true});
  });
}

function userGetPhotos(order_id,product_id) {
  api.get('album/customer/customerCurrentEditing/'+order_id,{
  })
  .then(async(response) => {
    console.log(response.data.data);
    store.dispatch({type:'CLOSE_OVERLAY'});
    for (const [id, photo] of Object.entries(response.data.data.photo_details[product_id])) {

      let textInfo = null;
      if(photo.details.title!=null){
        textInfo = {
          adminTitle:photo.admin_title,
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

      store.dispatch({type:'ADD_IMAGE_START',image:{order:photo.details.sequence,loading:true}});

      let image = new Image();
      image.onload = async function () {
        store.dispatch({type:'ADD_IMAGE_SUCCESS',image:{url:this.src,height:this.height,width:this.width,id:id,textInfo:textInfo,iconInfo:iconInfo,order:photo.details.sequence}})
        
        if (photo.details.title.title!=null) {
          let getPhotoBase64 = await api.get('album/getPhotoBase64/customer/'+photo.details.title.title);
          let img_base64 = getPhotoBase64.data.data;
          if(!img_base64.includes("data:image")) img_base64 = 'data:image/jpg;base64,'+img_base64;
          store.dispatch({type:'ADD_TITLE_IMAGE',id:id,image:{url:img_base64,id:photo.details.title.title}});
        }
        else if(photo.admin_title!=null&&photo.admin_title!='') titleToImage(id,photo.admin_title);

        if(photo.details.photo!=null) {
          let getPhotoBase64 = await api.get('album/getPhotoBase64/customer/'+photo.details.photo);
          console.log(getPhotoBase64.data);
          let img_base64 = getPhotoBase64.data.data;
          if(!img_base64.includes("data:image")) img_base64 = 'data:image/jpg;base64,'+img_base64;
          userSelectIcon(img_base64,photo.details.photo,id);
        }
    
      };

      let getPhotoBase64 = await api.get('album/getPhotoBase64/base/'+id);
      let img_base64 = getPhotoBase64.data.data;
      image.src = img_base64;
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
  image.src = icon_base64;
}

function userUploadIcon(icon,original) {
  let body = {
    "customer":status().demo?null:status().customer_id,
    "img_base64":icon.base64,
    "isTest":status().demo?1:0,
    "useOriginal":original,
  }
  api.post('customer/saveCustomerPhoto', body,{
  })
  .then((response) => {
    console.log(response.data.data);
    if (response.data.status==200) {
      let image = new Image();
      image.onload = function () {
        store.dispatch({type:'ADD_ICON_SUCCESS',icon:{url:this.src,height:this.height,width:this.width,id:status().demo?Math.random().toString(36).substr(2, 9):response.data.data.img_uuid}});
      };
      image.src = original==1? response.data.data.img_base64: 'data:image/jpg;base64,'+response.data.data.img_base64;
    }
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
    store.dispatch({type:'SET_OVERLAY',mode:'message',message:error.response.data.message,cancel:true});
    store.dispatch({type:'ADD_ICON_FAIL'});
  });
}

function userUpdatePhotos(photos,confirm) {
  let photoDetails = {};
  photos.forEach(photo=>{
    console.log(photo.textImage);

    if( (photo.iconInfo!=null&&photo.iconSelected!=null) || (photo.textImage&&photo.textImage.id) ){

      photoDetails[photo.id] = {};

      if(photo.iconInfo!=null&&photo.iconSelected!=null) {
        photoDetails[photo.id].details = {
            "photo":photo.iconSelected,
            "position":[photo.iconInfo.x,photo.iconInfo.y],
            "size":[photo.iconInfo.height*photo.iconInfo.scale,photo.iconInfo.width*photo.iconInfo.scale],
            "rotate":photo.iconInfo.rot,
        };
      }

      if(photo.textImage&&photo.textImage.id) photoDetails[photo.id].details = {...photoDetails[photo.id].details, ...{"title":photo.textImage.id,} };
    }
  })
  
  let body = {
    "product":status().product_id,
    "customer":status().customer_id,
    "order":status().order_id,
    "confirm":confirm,
    "photo_details": photoDetails,
  }

  api.post('album/customerUpdatePhoto', body,{
  })
  .then((response) => {
    console.log(response.data);
    store.dispatch({type:'SET_OVERLAY',mode:'message',message:response.data.message,cancel:true});
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
    store.dispatch({type:'SET_OVERLAY',mode:'message',message:error.response.data.message});
  });
}

function titleToImage(photo_id,titleText,finish) {
 
  let real_text = titleText;
  real_text = realText(titleText,'Customer');

  let mode = 0;
  if (status().mode=='admin') mode = 1;
  else if (status().mode=='user') mode = 2;

  let body = {
    "customer":status().mode=='user'?status().customer_id:null,
    "photo_uuid":photo_id,
    "title":real_text,
    "mode":mode,
  }
  api.post('album/textToImg', body,{
  })
  .then((response) => {
    if (response.data.status==200) {
      let image_base64 = 'data:image/jpg;base64,'+response.data.data.img_base64;
      if(status().mode=='admin'){
        store.dispatch({type:'ADD_TITLE_IMAGE',id:photo_id,title:titleText,image:{url:image_base64}});
        adminUpdatePhotos([store.getState().images.find(image => image.id == photo_id)]);
      }
      else if (status().mode=='user')store.dispatch({type:'ADD_TITLE_IMAGE',id:photo_id,title:titleText,image:{id:response.data.data.img_uuid,url:image_base64}});
    }
    if(finish)finish();
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
    store.dispatch({type:'TITLE_IMAGE_LOADING_END',id:photo_id});
    if(finish)finish();
  });
}

function realText(titleText,subText) {
  let customer_text = '{**Customer_INPUT**}';
  let start_pos = titleText.indexOf(customer_text);
  let end_pos = start_pos + customer_text.length;

  if(start_pos==-1) return titleText;
  else return titleText.substr(0,start_pos) + subText + titleText.substr(end_pos,titleText.length-end_pos);
}

function demoGetPhoto(product_id) {
  api.get('album/getDemo/'+product_id,{
  })
  .then(async(response) => {
    console.log(response.data.data);
    store.dispatch({type:'CLOSE_OVERLAY'});
    let photo = response.data.data;
    if (photo){

      let details = JSON.parse(photo.photo_details);

      console.log(details);

      let textInfo = null;
      if(details.title!=null){
        textInfo = {
          adminTitle:details.title.title,
          height:details.title.size[0],
          width:details.title.size[1],
          scale:1,
          x:details.title.position[0],
          y:details.title.position[1],
          rot:details.title.rotate,
        }
      }

      let iconInfo = {
        size: details.size,
        width: details.size[1],
        height: details.size[0],
        x: details.position[0],
        y: details.position[1],
        rot: details.rotate,
        scale:1,
      }


      let image = new Image();
      image.onload = async function () {
        store.dispatch({type:'ADD_IMAGE',image:{url:this.src,height:this.height,width:this.width,id:photo.uuid,textInfo:textInfo,iconInfo:iconInfo,order:0}})
        
        if(details.title&&details.title.title!=null&&details.title.title!='') titleToImage(photo.uuid,details.title.title);    
      };

      image.src = photo.img_base64;
    }
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
    // store.dispatch({type:'CLOSE_OVERLAY'});
  });
}