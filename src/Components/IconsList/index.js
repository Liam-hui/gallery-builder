import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import store from '../../store';
import { useSelector } from "react-redux";
import Slider from '../../Components/Slider';
import AddImage from '../../Components/AddImage';

function IconsList(props) {

  const display = useSelector(state => state.display);
  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);
  const icons = useSelector(state => state.icons);

  const image = () => {
    return images.find(image => image.id == imageSelected);
  }

  let WIDTH,HEIGHT;
  if(display=='large') {WIDTH=240;HEIGHT='100%';}
  else if (display=='smallPort') {WIDTH='100%';HEIGHT='100%'}
  else if (display=='smallLand') {WIDTH=150;HEIGHT='100%';}
  let containerStyle = {width:WIDTH,height:HEIGHT}

  return (
    <div className="iconsListContainer" style={containerStyle}>

      {display=='large'?<AddImage/>:null}

        <Slider mode='icon' border={false} vertical={display!='smallPort'} images={icons} canDelete={true} canDrag={false} selectedId={image()?image().iconSelected:-1} selectedText={'已選擇'}
          selectItem={(id)=>{
            if(imageSelected!=-1) store.dispatch({type:'SELECT_ICON',iconId:id,id:imageSelected});
          }}
          deleteItem={(id)=>{
            if(!images.some(image=>image.iconSelected==id)) store.dispatch({type:'DELETE_ICON_SUCCESS',id:id});
            // store.dispatch({type:'DELETE_ICON_START',id:id});
          }}
        />

    </div>
  );
}

export default IconsList;



