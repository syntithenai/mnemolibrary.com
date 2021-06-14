import React, { Component } from 'react';
import {Modal,Button} from 'react-bootstrap'
   
   
const ModalDialog = function(props) {
	return     <Modal.Dialog show={true} >
  <Modal.Header closeButton>
    <Modal.Title>{props.title}</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <p>{props.message}</p>
	<div style={{textAlign:'center'}} >{Array.isArray(props.buttons) && props.buttons.map(function(button) {
		return <Button variant={button.variant ? button.variant : "primary"} style={{marginRight:'1em'}} onClick={button.onClick} >{button.label}</Button>
 	})}</div>

  </Modal.Body> 
 
  
</Modal.Dialog>
} 

export default ModalDialog
