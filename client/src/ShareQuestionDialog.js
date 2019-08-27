/* eslint-disable */ 
import React, { Component } from 'react';

import {
  FacebookShareButton,
  TwitterShareButton,
  //EmailShareButton,
  //FacebookShareCount
  //GooglePlusShareButton,
  //LinkedinShareButton,
  //WhatsappShareButton,
  //PinterestShareButton,
  //RedditShareButton,
  //TumblrShareButton,
} from 'react-share';
//import Utils from './Utils';
          

import Email from 'react-icons/lib/fa/envelope-o';
import Twitter from 'react-icons/lib/fa/twitter';
import Facebook from 'react-icons/lib/fa/facebook';

export default class ShareDialog extends Component {
    
    render() {
        let question=this.props.question;
        //let mailTo='mailto:?subject=Mnemos Library - '+this.props.header+'&body='+this.props.shareLink;
        //let twitterText= this.props.question.mnemonic ? this.props.question.mnemonic : '';
        //let header = Utils.getQuestionTitle(question);

        // use the question link as the main link if available (so article images show on social network)
        // fallback to generated link back to nemo
        let shareLink = window.location.protocol+'//'+window.location.host+"/discover/topic/"+encodeURIComponent(question.quiz)+"/"+question._id;          
        //let shareLink=window.location.protocol+'//'+window.location.host+"/discover/topic/"+question.quiz+"/"+question._id;          
        //let mainLink=question.link ? question.link : shareLink;
        // where we haven't used the link as the main link, 
        //let otherLink=question.link ? shareLink : "";
       // let bothLinks = mainLink + "  \n\n" + otherLink;
        
        
        let title="Mnemo's Library -"+(this.props.question.mnemonic ? this.props.question.mnemonic : '') + " - \n" + question.interrogative+ ' ' +question.question + '?';
        let longTitle=(this.props.question.mnemonic ? this.props.question.mnemonic : '') + "  \n" + question.interrogative+ ' ' +question.question + '?' ;
        let twitterTitle=(this.props.question.mnemonic ? this.props.question.mnemonic : '') + "  \n" + question.interrogative+ ' ' +question.question  + "?\n" + question.link;
        
        
        //let allTogether = title + "  \n" + otherLink  + "  \n" + mainLink ;
        
        let mailTo='mailto:?subject='+title+'&body='+shareLink;
        
        return  (
            <div id="sharedialog" className="modal" tabIndex="-1" role="dialog">
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Share using</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <a className='btn btn-primary' href={mailTo} target='_new' ><Email size={26} />&nbsp;Email</a>
                    <br/>
                    <br/><TwitterShareButton className='btn btn-primary' title={twitterTitle} url={shareLink} hashtags={["MnemosLibrary"]}><Twitter size={26} />&nbsp;Twitter</TwitterShareButton>
                    
                  </div>
                </div>
              </div>
            </div>
            
        )
    };
    
}
//<br/><br/><FacebookShareButton className='btn btn-primary' quote={longTitle} url={shareLink}  ><Facebook size={26} />&nbsp;Facebook</FacebookShareButton>
                    
//<GooglePlusShareButton />
                    //<LinkedinShareButton/>
                    //<WhatsappShareButton/>
                    //<PinterestShareButton/>
                    //<RedditShareButton/>
                    //<TumblrShareButton/>
                      
 //<a  target='_new'  href={mailTo} className='btn btn-primary'  ><Email size={26}  />&nbsp;<span >&nbsp;Email</span></a>
                      //&nbsp;&nbsp;
                     
                     
                      //<a target="_new"  className="btn btn-primary twitter-share-button"
                      //href={twitterLink}
                      //data-size="large"><Twitter size={26}  />&nbsp;<span >&nbsp;Tweet</span></a>  
                      //&nbsp;&nbsp;
                     //<div  className="fb-share-button" 
                        //data-href={this.props.shareLink}
                        //data-size="large" data-mobile-iframe="true"
                        //data-layout="button_count" > </div>
                      //&nbsp;&nbsp;   
