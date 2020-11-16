import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import Slider from '../../Components/Slider';


function ImagesList() {
  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);

  return (
    <Slider images={images} selectedId={imageSelected} selectedText={'圖片編輯中'} selectItem={(id)=>store.dispatch({type:'SELECT_IMAGE',id:id})} 
      deleteItem={(id)=>{
          if(imageSelected==id) {
            let index = images.findIndex(image => image.id == imageSelected);
            if(index<images.length-1) index += 1;
            else index -= 1;
            if(index==-1)  store.dispatch({type:'SELECT_IMAGE',id: -1});
            else store.dispatch({type:'SELECT_IMAGE',id:images[index].id});
          }
          store.dispatch({type:'DELETE_IMAGE',id:id});
        }
      }
    />
  );
}

export default ImagesList;
