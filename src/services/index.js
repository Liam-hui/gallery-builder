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
    // store.dispatch({type:'CLOSE_OVERLAY'});
    if(Object.entries(response.data.data).length==0) store.dispatch({type:'CLOSE_OVERLAY'});
    else store.dispatch({type:'INIT_IMAGES',count:Object.entries(response.data.data).length});
    for (const [id, photo] of Object.entries(response.data.data)) {
      let temp_id = Math.random().toString(36).substr(2, 9);
      if(photo.sequence>-1){

        let iconInfo = {
          size: [parseFloat(photo.details.size[0]),parseFloat(photo.details.size[1])],
          x: parseFloat(photo.details.position[0]),
          y: parseFloat(photo.details.position[1]),
          rot: parseFloat(photo.details.rotate),
          scale:1,
          height:parseFloat(photo.details.size[0]),
          width:parseFloat(photo.details.size[1]),
        }

        let textInfo = null;
        if(photo.details.title!=null){
          textInfo = {
            title:photo.details.title.title,
            height:parseFloat(photo.details.title.size[0]),
            width:parseFloat(photo.details.title.size[1]),
            scale:1,
            x:parseFloat(photo.details.title.position[0]),
            y:parseFloat(photo.details.title.position[1]),
            rot:parseFloat(photo.details.title.rotate),
            color:photo.details.title.color,
          }
        }

        store.dispatch({type:'ADD_IMAGE_START',image:{id:temp_id,order:photo.sequence,loading:true}});

        let image = new Image();
        image.onload = function () {
          store.dispatch({type:'ADD_IMAGE_SUCCESS',ori_id:temp_id,image:{url:this.src,height:this.height,width:this.width,id:id,iconInfo:iconInfo,textInfo:textInfo,order:photo.sequence}});  
          if(photo.details.title!=null&&photo.details.title.title!=null) titleToImage(id,photo.details.title.title);
        };

        let getPhotoBase64 = await api.get('album/getPhotoBase64/base/'+id);
        let img_base64 = getPhotoBase64.data.data;

        if(img_base64!=null) image.src = img_base64;
      }
    }
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
    store.dispatch({type:'CLOSE_OVERLAY'});
  });
}

function adminUploadPhoto(photos) {
  let body = new FormData();
  body.append('product', status().product_id);

  photos.forEach((photo,index)=>{
    let size = Math.max(photo.width,photo.height)*0.2;

    body.append(`photos[${index}][type]`, 'new');
    body.append(`photos[${index}][id]`, photo.id);
    body.append(`photos[${index}][sequence]`, photo.order);
    body.append(`photos[${index}][image]`, photo.file);
    body.append(`photos[${index}][photo_details][position][0]`, photo.width*0.5);
    body.append(`photos[${index}][photo_details][position][1]`, photo.height*0.5);
    body.append(`photos[${index}][photo_details][size][0]`, size);
    body.append(`photos[${index}][photo_details][size][1]`, size);
    body.append(`photos[${index}][photo_details][rotate]`, 0);

  });

  api.post('album/adminAddPhotoForm', body,{
    headers: { 'Content-Type': 'multipart/form-data'  },
  })
  .then((response) => {
    if (response.data.status==200) {
      console.log(response.data.data);
      for(const photo of photos){
        let size = Math.max(photo.width,photo.height)*0.2;
        let iconInfo = {
          size: [size,size],
          height:size,
          width:size,
          x: photo.width*0.5,
          y: photo.height*0.5,
          rot: 0,
          scale:1,
        }

        store.dispatch({type:'ADD_IMAGE',image:{url:photo.base64,height:photo.height,width:photo.width,id:response.data.data[photo.id],iconInfo:iconInfo,order:photo.order}})
      }
      store.dispatch({type:'CLOSE_OVERLAY'});
    }
  }, (error) => {
    if(error&&error.response) {
      console.log(error.response.data);
    }
  });
}

function adminDeletePhoto(photo_id,deleteImage) {
  let body = new FormData();
  body.append('product', status().product_id);
  body.append(`photos[0][type]`, 'delete');
  body.append(`photos[0][id]`, photo_id);

  api.post('album/adminAddPhotoForm', body,{
    headers: { 'Content-Type': 'multipart/form-data'  },
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
  let body = new FormData();
  body.append('product', status().product_id);

  photos.forEach((photo,index)=>{

    body.append(`photos[${index}][type]`, 'update');
    body.append(`photos[${index}][id]`, photo.id);
    body.append(`photos[${index}][sequence]`, photo.order);
    body.append(`photos[${index}][photo_details][position][0]`, photo.iconInfo.x);
    body.append(`photos[${index}][photo_details][position][1]`, photo.iconInfo.y);
    body.append(`photos[${index}][photo_details][size][0]`, photo.iconInfo.height*photo.iconInfo.scale);
    body.append(`photos[${index}][photo_details][size][1]`, photo.iconInfo.width*photo.iconInfo.scale);
    body.append(`photos[${index}][photo_details][rotate]`, photo.iconInfo.rot);

    if(photo.textInfo!=null) {
      body.append(`photos[${index}][photo_details][title][title]`, photo.textTitle);
      body.append(`photos[${index}][photo_details][title][position][0]`, photo.textInfo.x);
      body.append(`photos[${index}][photo_details][title][position][1]`, photo.textInfo.y);
      body.append(`photos[${index}][photo_details][title][size][0]`, photo.textInfo.height*photo.textInfo.scale);
      body.append(`photos[${index}][photo_details][title][size][1]`, photo.textInfo.width*photo.textInfo.scale);
      body.append(`photos[${index}][photo_details][title][rotate]`, photo.textInfo.rot);
      if(color) {
        body.append(`photos[${index}][photo_details][title][color]`, color);
        store.dispatch({type:'UPDATE_COLOR',id:photo.id,color:color});
      }
    }

  });

  api.post('album/adminAddPhotoForm', body,{
    headers: { 'Content-Type': 'multipart/form-data'  },
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
    console.log('hereee');
    console.log(response.data.data);
    // store.dispatch({type:'CLOSE_OVERLAY'});
    store.dispatch({type:'INIT_IMAGES',count:Object.entries(response.data.data.photo_details[product_id]).length});
    for (const [id, photo] of Object.entries(response.data.data.photo_details[product_id])) {

      let textInfo = null;
      if(photo.details.title!=null){
        textInfo = {
          adminTitle:photo.admin_title,
          title:photo.details.title.title,
          height:parseFloat(photo.details.title.size[0]),
          width:parseFloat(photo.details.title.size[1]),
          scale:1,
          x:parseFloat(photo.details.title.position[0]),
          y:parseFloat(photo.details.title.position[1]),
          rot:parseFloat(photo.details.title.rotate),
        }
      }

      let iconInfo = {
        size: [parseFloat(photo.details.size[0]),parseFloat(photo.details.size[1])],
        width: parseFloat(photo.details.size[1]),
        height: parseFloat(photo.details.size[0]),
        x: parseFloat(photo.details.position[0]),
        y: parseFloat(photo.details.position[1]),
        rot: parseFloat(photo.details.rotate),
        flip: parseFloat(photo.details.flip)==1?true:false,
        scale:1,
      }

      store.dispatch({type:'ADD_IMAGE_START',image:{order:photo.details.sequence,loading:true}});

      let image = new Image();
      image.onload = async function () {
        store.dispatch({type:'ADD_IMAGE_SUCCESS',image:{url:this.src,height:this.height,width:this.width,id:id,textInfo:textInfo,iconInfo:iconInfo,order:photo.details.sequence}})
        
        if(photo.details.photo!=null) {
          let getPhotoBase64 = await api.get('album/getPhotoBase64/customer/'+photo.details.photo);
          let img_base64 = getPhotoBase64.data.data;
          if(!img_base64.includes("data:image")) img_base64 = 'data:image/jpg;base64,'+img_base64;
          userSelectIcon(img_base64,photo.details.photo,id);
        }

        if (photo.details.title&&photo.details.title.title!=null) {
          let getPhotoBase64 = await api.get('album/getPhotoBase64/customer/'+photo.details.title.title);
          let img_base64 = getPhotoBase64.data.data;
          if(!img_base64.includes("data:image")) img_base64 = 'data:image/jpg;base64,'+img_base64;
          store.dispatch({type: 'ADD_TITLE_IMAGE',id:id,image:{url:img_base64,id:photo.details.title.title}});
        }
        else if(photo.admin_title!=null&&photo.admin_title!='') titleToImage(id,photo.admin_title);

      };

      let getPhotoBase64 = await api.get('album/getPhotoBase64/base/'+id);
      console.log(id);
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
        console.log(convertDataURIToBlob(this.src));
        store.dispatch({type:'ADD_ICON_SUCCESS',icon:{url:convertDataURIToBlob(this.src),height:this.height,width:this.width,id:status().demo?Math.random().toString(36).substr(2, 9):response.data.data.img_uuid}});
      };
      let img_base64 = response.data.data.img_base64;
      if(!img_base64.includes("data:image")) img_base64 = 'data:image/jpg;base64,'+img_base64;
      image.src = img_base64;
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

    if( (photo.iconInfo!=null&&photo.iconSelected!=null) || (photo.textImage&&photo.textImage.id) ){

      photoDetails[photo.id] = {};

      if(photo.iconInfo!=null&&photo.iconSelected!=null) {
        photoDetails[photo.id].details = {
            "photo":photo.iconSelected,
            "position":[photo.iconInfo.x,photo.iconInfo.y],
            "size":[photo.iconInfo.height*photo.iconInfo.scale,photo.iconInfo.width*photo.iconInfo.scale],
            "rotate":photo.iconInfo.rot,
            "flip":photo.iconInfo.flip?1:0,
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

  console.log(body);

  api.post('album/customerUpdatePhoto', body,{
  })
  .then((response) => {
    console.log(response.data);
    if(confirm)store.dispatch({type:'SET_OVERLAY',mode:'message',message:response.data.message,confirm:window.closeApp});
    else store.dispatch({type:'SET_OVERLAY',mode:'message',message:response.data.message,cancel:true});
  }, (error) => {
    if(error&&error.response) console.log(error.response.data);
    store.dispatch({type:'SET_OVERLAY',mode:'message',message:error.response.data.message});
  });
}

function titleToImage(photo_id,titleText,finish) {
 
  let real_text = titleText;
  real_text = realText(titleText,'Customer');

  let mode;
  if(status().demo) mode = 0;
  else if (status().mode=='admin') mode = 1;
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
    console.log(response.data.data);
    if (response.data.status==200) {
      let image_base64 = response.data.data.img_base64;
      if(!image_base64.includes("data:image")) image_base64 = 'data:image/jpg;base64,'+image_base64;
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
          height:parseFloat(details.title.size[0]),
          width:parseFloat(details.title.size[1]),
          scale:1,
          x:parseFloat(details.title.position[0]),
          y:parseFloat(details.title.position[1]),
          rot:parseFloat(details.title.rotate),
        }
      }

      let iconInfo = {
        size: [parseFloat(details.size[0]),parseFloat(details.size[1])],
        width: parseFloat(details.size[1]),
        height: parseFloat(details.size[0]),
        x: parseFloat(details.position[0]),
        y: parseFloat(details.position[1]),
        rot: parseFloat(details.rotate),
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

function convertDataURIToBlob(dataURI) {
  var BASE64_MARKER = ';base64,';

  if(!dataURI) return;

  // Convert image (in base64) to binary data
  var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  var base64 = dataURI.substring(base64Index);
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
  }

  let imageDataBlob = new Blob([array], {type: "image/jpeg"});

  return URL.createObjectURL(imageDataBlob);
}