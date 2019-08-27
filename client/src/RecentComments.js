/* eslint-disable */ 
import React, { Component } from 'react';
import Utils from './Utils';
import TrashIcon from 'react-icons/lib/fa/trash';
import EditIcon from 'react-icons/lib/fa/pencil';
import NewIcon from 'react-icons/lib/fa/plus';
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'

import scrollToComponent from 'react-scroll-to-component';

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import {debounce} from 'throttle-debounce';

import CommentIcon from 'react-icons/lib/fa/comment';
import CommentList from './CommentList';

export default class RecentComments extends Component {
    constructor(props) {
        super(props);
        //let question = this.props.question ? this.props.question : {};
        this.state={filter:''}
		this.scrollTo={};
		this.setFilter = this.setFilter.bind(this)
        this.loadComments = this.loadComments.bind(this)
    //   this.scrollToComment = this.scrollToComment.bind(this)
    };
    
    componentDidMount() {
        this.loadComments(null,null,50,null,1)
        //if (this.props.match && this.props.match.param && this.props.match.param.comment) this.scrollToComment(this.props.match.param.comment)
    }
    
    componentDidUpdate(props,state) {
		if (this.state.filter != state.filter) {
			this.loadComments(null,null,50,this.state.filter,500)
        }
        //if (this.props.match && this.props.match.param && this.props.match.param.comment) this.scrollToComment(this.props.match.param.comment)
    }
    
    loadComments(a,b,c,d,timeout) {
		let that = this;
		clearTimeout(this.debounce);
		setTimeout(function() {
			that.props.loadComments(a,b,c,d)
		},timeout)
		//debounce(5000,this.props.loadComments(a,b,c,d));
	}

    //scrollToComment(id) {
		//let that = this;
		//scrollToComponent(that.scrollTo['comment_'+id],{align:'top',offset:-230});
	//}
	



	setFilter(event) {
		let val = event.target.value;
		this.setState({filter:val})
	}


    render() {
		this.props.analyticsEvent('recent comments');

		return <div id='recentcomments'>
		 <input className="form-control" type="text" value={this.state.filter} onChange={this.setFilter}  placeholder="Search" aria-label="Search" />
				  
		<CommentList match={this.props.match} analyticsEvent={this.props.analyticsEvent} comments={this.props.comments} isAdmin={this.props.isAdmin} newCommentReply={this.props.newCommentReply}   editComment={this.props.editComment}  deleteComment={this.props.deleteComment} user={this.props.user} /></div>
		
		//let that = this;
		//if (this.props.comments && this.props.comments.length > 0) {
			//let renderedComments = 	this.props.comments.map(function(comment) {
					//let current_datetime = new Date(comment.createDate)
					//let formatted_date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear()
					//let joinWord = comment.type==="question" ? 'asks' : 'says'
					//let titleWord = comment.type==="question" ? 'Question' : 'Comment'
					//let questionLink = '/discover/topic/'+comment.questionTopic+"/"+comment.question;
					//let repliesRendered = null;
					//if (comment.replies && comment.replies.length > 0) {
						//repliesRendered = comment.replies.map(function(reply) {
							//let reply_formatted_date = reply && reply.createDate ? new Date(reply.createDate).getDate() + "-" + (new Date(reply.createDate).getMonth() + 1) + "-" + new Date(reply.createDate).getFullYear() : null;
							
							//return <div style={{paddingLeft:'0.2em'}}> <span >
									//<span className='date' style={{fontWeight:'bold',marginRight:'2em'}} >{reply_formatted_date}</span>

									//<b>{reply.userAvatar}</b> replied <i>"{reply.text}"</i></span>
								//</div>
						//});
					//} 
					//return <div key={comment._id} >
						//<div style={{float:'right'}}>
							//<button   className="btn btn-primary" onClick={(e) => that.props.editComment(comment)} ><EditIcon size={26}  />&nbsp;<span className="d-none d-md-inline-block">Edit</span></button>
							//<button   className="btn btn-danger" onClick={(e) => that.props.deleteComment(comment)} ><TrashIcon size={26}  />&nbsp;<span className="d-none d-md-inline-block">Delete</span></button>
						//</div>
						
						//<div style={{paddingLeft:'0.2em'}}> <span >
							//<span className='date' style={{fontWeight:'bold',marginRight:'2em'}} >{formatted_date}</span>

							//<b>{comment.userAvatar}</b> {joinWord} <i>"{comment.comment}"</i></span>
						//</div>
							
						//{comment.questionText && <div><div><b>Topic: </b> {comment.questionTopic}</div>
						//<div><b>Related Question: </b> <Link to={questionLink} >{comment.questionText}</Link></div></div>}
						//{repliesRendered && <div><b>Replies:</b> {repliesRendered}	</div>}
						//<hr/>
					//</div>
					
				//})
				
					
					
				
			//let renderedComments = this.props.comments.map(function(comment,key) {
				//let current_datetime = new Date(comment.createDate)
				//let formatted_date = current_datetime.getDate() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getFullYear()
				//let questionLink = '/discover/topic/'+comment.questionTopic+'/'+comment.question
				//let spanId = 'comment_'+comment._id
				//return  <span style={{border: '1px solid black', width:'100%'}} id={spanId} key={comment._id} ref={(section) => { that.scrollTo[spanId] = section; }}>
						//{(that.props.isAdmin() || (that.props.user && comment.user === that.props.user._id)) && <span className='buttons' style={{float:'right'}} >
							//<button   className="btn btn-primary" onClick={(e) => that.props.editComment(comment)} ><EditIcon size={26}  />&nbsp;<span className="d-none d-md-inline-block">Edit</span></button>

							//<button   className="btn btn-danger" onClick={(e) => that.props.deleteComment(comment)} ><TrashIcon size={26}  />&nbsp;<span className="d-none d-md-inline-block">Delete</span></button>
						//</span>}
							
							
						//<div className='questiondtext' ><Link to={questionLink} >{comment.questionText}</Link></div>
						
						//<span className='date' style={{fontWeight:'bold',marginRight:'2em'}} >{formatted_date}</span>
						//<span className='user' >by {comment.userAvatar}</span>
						//<div className='comment' >{comment.comment}</div>
						//<hr/>
					//</span>
			//});
			
			//return <div style={{marginTop:'1em'}}>				
				//{renderedComments}
			//</div>
			
		//} else {
			//return null;
		//}
	}
};

