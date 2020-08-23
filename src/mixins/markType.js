import AppUtil from "@/utils/AppUtil.js";
import moduleApi from "@/api.js";
import $ from 'jquery';
import * as articleData from "@/assets/article.js";//TODO:假数据

//对原第三步实体和关系标注抽取出mixin
export default {
    data () {
        return {
            moduleType: 'home',

            curParaMark: "",
            pair: [],
            flag_mark_double: false,
            
            lastSelection: {
                start: -1,
                end: -1,
                startContainer: null,
                endContainer: null
            },
            
            lastPara: null,
			lastItem: null,
			lastText: null,
			lastIndex: -1,
			lastActiveIndex: -1,//选择段落的时候请求对应标签的索引记录

			classname: 'ts-text-active',
        }
    },
    computed:{
        canHandleTag(){
            return (this.activeName == 'three'||this.moduleType == 'type');
        }
    },
    mounted(){
    },
    methods: {
        removeSelection(){
            window.getSelection().removeAllRanges();
            this.flag_mark_double = false;
		},
        //根据标注内容构成的数组，恢复为字符串
		handleCont(contArr){
			var str = '';
			for(var item of (contArr || [])){
				var items = item.split(/\/\*-/);//用/*-分隔，如“4天/*-2==持续时间==k2mwjvmo”
				var cont = items[0];
				var classid = items[1] || '';
				if(classid !== 'undefined'){
					var r = classid.split('==');
					classid = r[0];//实体类别id
					var text = r[1];//实体类别名称
					var dotid = r[2];//具体标注的实体赋予的唯一id
					var color = r[3];//当时标注的实体标签的对应的颜色
					var colors = AppUtil.hexToRgb(color);
					str += `<span data-flag="0" style="background-color:rgba(${colors.r},${colors.g},${colors.b}, 0.4);" data-id="${classid}" data-dot="${dotid}" data-color="${color}"><b>` + cont + `</b><em><i class="ts-text" style="background-color:#${color};" title="${text}" data-dot="${dotid}">`+text+'</i><i class="ts-icon el-icon-delete"></i></em></span>';
				}else{
					str += cont;
				}
			}
			return str;
		},
		handleContAndRel(cb){
			this.paras.map((para, index)=>{
				//处理cont内容，添加标注的标签
				para.contShadow = para.cont;//初始cont内容字段的备份
				var str = this.handleCont(para.cont);
				para.cont = str;
				//如下对添加的标签进行间隔调整
				this.$nextTick(()=>{
					var isBlock4 = this.activeName == 'four';
					var block = this.$refs['block-'+(isBlock4?'4':'3')];
					var node = block.querySelector('#ts-entity-item-'+para.id);
					this.reRenderTagMargin(node);
					// this.reRenderParaPadding(node);//TODO:
					//绘制连线
					(!isBlock4) && this.$refs['paraItem'][index].reRenderSvgWidth().renderRelData(para.rel);

					cb && cb(para);//回调函数：用于第四部对标签内部细标进行处理渲染
				});
			});
		},
		//对应点击了段落，需要加载该段落对应的实体和关系标签
		handleClickParaSvg(index){
			var para = this.paras[index];
			this.curParaMark = para.mark;
			//api 请求当前段落的标签列表
			this.getThreeLabel(para.markId);
		},
		async getThreeLabel(id){
            this.tags = articleData.tags;
            this.rels = articleData.rels;

            AppUtil.giveTagColor(this.tags);
            AppUtil.giveTagColor(this.rels, 1);
            return;

			var res = await moduleApi.getThreeLabel({
				labelId: id
			});
			if(res.code == "0"){
				this.tags = res.classList;
				this.rels = res.relationList;

				AppUtil.giveTagColor(this.tags);
				AppUtil.giveTagColor(this.rels, 1);
			}else{
				this.$message.error(res.msg);
			}
		},
		//如果选择的区域跨段或标签，则取消选择
        crossSection(){
			var selObj = window.getSelection();
            if(selObj.toString().indexOf('\n') != -1){
                this.removeSelection();
                return true;
			}
			var range = selObj.getRangeAt(0);
			if(range.startContainer.parentNode.tagName.toLowerCase() != 'div' || range.endContainer.parentNode.tagName.toLowerCase() != 'div'){
				this.$message.warning('不能跨标签标注');
				this.removeSelection();
				return true;
			}
            return false;
		},
		setLastSelection(range){
            this.lastSelection.start = range.startOffset;
            this.lastSelection.end = range.endOffset;
            this.lastSelection.startContainer = range.startContainer;
            this.lastSelection.endContainer = range.endContainer;
		},
		//对段落中点击事件的监听（包含选区的选择、点击标签、删除标签等处理）
		chooseSelection(evt, index){
            var target = evt.target;
			//index为-999对实体细标进行特殊处理
			if(this.moduleType == 'home' && index != -999 && this.lastActiveIndex != index){
				//需要请求当前段落对应的标签
				this.handleClickParaSvg(index);
			}
			if(target.tagName.toLowerCase() == 'i'){
				var className = target.className;
				if(className.includes('ts-text')){//点选标签，进行关系连线
					this.canHandleTag && this.chooseTag(target, index);
				}else if(className.includes('ts-icon')){//删除标签
					this.delTag(target, index);
				}
				return;
			}
			this.lastPara = target;
			this.lastIndex = index;
			
            var selObj = window.getSelection();
			var range  = selObj.getRangeAt(0);
			var startOffset = range.startOffset;
            var endOffset = range.endOffset;
            if(index != -999){
				if(this.crossSection()) return;
			}
            try{
                if(this.flag_mark_double && selObj.type == 'Range'){//当开始已经通过点击标注，然后又选择了区域的情况
					this.setLastSelection(range);
                    //TODO:已经记不清当初为什么这么处理，先注释掉保留
                    // selObj.collapseToStart();
                    // selObj.extend(this.lastSelection.startContainer, this.lastSelection.end+1);
                    // this.lastSelection.end += 1;
                    return;
                }
                if(selObj.isCollapsed || startOffset == endOffset){
                    endOffset += 1;
                    if(!this.flag_mark_double){
                        selObj.modify('extend', 'right', 'character');
                        this.setLastSelection(range);
                        this.flag_mark_double = true;
                    }else{
                        //点击的区域是往后扩展
                        if(startOffset >= this.lastSelection.start){
                            selObj.modify('extend', 'right', 'character');
                            selObj.collapseToEnd();
                            selObj.modify('extend', 'right', 'character');
                            selObj.extend(this.lastSelection.startContainer, this.lastSelection.start);
                            this.lastSelection.end = endOffset;
						}else{//点击的区域往前扩展
                            selObj.collapseToStart();
                            selObj.extend(this.lastSelection.endContainer, this.lastSelection.end);
                            this.lastSelection.start = startOffset;
                        }
                        // if(this.crossSection()){//TODO:没用，没问题可以删除
						// 	return;
						// }
                    }
                }else{
                    if(!this.flag_mark_double){
                        //对应初始拖拽，记录为lastSelection，这样之后可以通过点击扩展选区
                        this.setLastSelection(range);
                        this.flag_mark_double = true;
                    }
                }
            }catch(e){
                console.log(e);
                //有的时候，当选择的区域临近span或者在span标签内，当点击扩展的时候，会出现extend方法调用出错的情况，因为extend不能跨元素扩展
                selObj.removeAllRanges();
                this.flag_mark_double = false;
            };
		},
		markTag(tag){
			if(!this.lastPara){
				this.$message.warning('请选择需要标注的实体');
				return;
			}
            var childNodes = this.lastPara.childNodes;
			var selObj = window.getSelection();
			var selText = selObj.toString();
            //对应进入页面之后直接点击标注，此时没有任何选区
            if(selObj.type == 'None') return;
            var range  = selObj.getRangeAt(0);
			var startOffset = range.startOffset;
			var endOffset = range.endOffset;
            //没有选区
            if(startOffset == 0 && endOffset == 0 && !this.lastPara.contains(range.startContainer)){
                return;
			}
			var classid = tag.id;
			var tagText = tag.text;
			var color = tag.color;
			var colors = AppUtil.hexToRgb(color);
			var dotid = AppUtil.getUniqueId();
			//初始文章第一次标注
			if(childNodes.length == 1){
				var nodeText = childNodes[0].textContent.trim();
                var prefix = nodeText.substring(0, startOffset);
                var template = `<span data-flag="0" style="background-color:rgba(${colors.r},${colors.g},${colors.b}, 0.4);" data-id="${classid}" data-dot="${dotid}" data-color="${color}"><b>` + nodeText.substring(startOffset, endOffset) + `</b><em><i class="ts-text" style="background-color:#${color};" title="${tagText}" data-dot="${dotid}">`+tagText+`</i><i class="el-icon-delete ts-icon"></i></em></span>`;
                var middle = template;
                var suffix = nodeText.substring(endOffset, nodeText.length);
                this.lastPara.innerHTML = prefix + middle + suffix;
			}else{
				//如果选中的区域是连续的
				if(range.startContainer == range.endContainer){
                    for(var idx in childNodes){
                        if (childNodes[idx] == range.startContainer ||
                        childNodes[idx] == range.startContainer.parentNode){
                            var nodeText = childNodes[idx].textContent;
                            var prefix = nodeText.substring(0, startOffset);
                            var template = `<span data-flag="0" style="background-color:rgba(${colors.r},${colors.g},${colors.b}, 0.4);" data-id="${classid}" data-dot="${dotid}" data-color="${color}"><b>` + nodeText.substring(startOffset, endOffset) + `</b><em><i class="ts-text" style="background-color:#${color};" title="${tagText}" data-dot="${dotid}">`+tagText+`</i><i class="ts-icon el-icon-delete"></i></em></span>`;
                            var middle = template;
                            var suffix = nodeText.substring(endOffset, nodeText.length);
                            $(childNodes[idx]).replaceWith( prefix + middle + suffix);
                            break;
                        }
                    }
                }else{//选中区域不连续
                    var isStart = false;
                    var repalce_span = ""
                    for(var idx in childNodes){
                        if (childNodes[idx] == range.startContainer || childNodes[idx] == range.startContainer.parentNode.parentNode){//找到span标签
                            isStart = true;
                            var nodeText = childNodes[idx].textContent;
                            var prefix = nodeText.substring(0, startOffset);
                            var suffix = `<span data-flag="0" style="background-color:rgba(${colors.r},${colors.g},${colors.b}, 0.4);" data-id="${classid}" data-dot="${dotid}" data-color="${color}"><b>` + nodeText.substring(startOffset, nodeText.length);
                            repalce_span =  prefix + suffix;
                            childNodes[idx].replaceWith("");
                        }else if(childNodes[idx] == range.endContainer || childNodes[idx] == range.endContainer.parentNode){
                            isStart = false;
                            var nodeText = childNodes[idx].textContent;
                            var prefix = nodeText.substring(0, endOffset) + `</b><em><i class="ts-text" style="background-color:#${color};" title="${tagText}" data-dot="${dotid}" data-color="${color}">`+tagText+`</i><i class="ts-icon el-icon-delete"></i></em></span>`;
                            var suffix = nodeText.substring(endOffset, nodeText.length);
                            repalce_span += prefix + suffix;
                            $(childNodes[idx]).replaceWith(repalce_span);
                            break;
                        }else{
	                        if(isStart){
	                            repalce_span += childNodes[idx].textContent;
	                            childNodes[idx].replaceWith("");
	                        }
                        }
                    }
                }
			}

			this.removeSelection();
			this.reRenderTagMargin(this.lastPara);
			this.canHandleTag && this.reRenderParaPadding(this.lastPara);//TODO:对于第四步细标不需要此调用
			//重新绘制该para的连线
			this.canHandleTag && (this.lastIndex!=-1) &&this.$refs['paraItem'][this.lastIndex].reDrawLines().reRenderSvgWidth();
		},
		reRenderParaPadding(para){
			if(!para.getAttribute('mark-tag')){
				var lastPT = parseInt(window.getComputedStyle(para).paddingTop,10);
				para.style.paddingTop = lastPT + 20 + 'px';
				para.setAttribute('mark-tag', 1);
			}
		},
		reRenderTagMargin(para){
			var marks = $(para).find('span[data-flag="0"]');
            for(var mark of marks){
                var w_text = $(mark).find('b').outerWidth();
                var w_tag = $(mark).find('em').outerWidth();
                if(w_text < w_tag){
                    mark.style.marginRight = (w_tag - w_text) + 'px';
                }
                mark.setAttribute('data-flag', 1);
            }
		},
		delTag(target, index){
			var span = $(target).parents('span');
			var para = $(target).parents('.ts-entity-item-text')[0];
			//需要删除相关连线
			var text = target.previousSibling;
			this.$refs['paraItem'][index].delDotRelations(text);

			span.replaceWith(span.find('b')[0].textContent);
			//如果当前段落中的标签都删除，则需要恢复UI
			if(para.querySelectorAll('span').length == 0){
				var lastPT = parseInt(window.getComputedStyle(para).paddingTop,10);
				para.style.paddingTop = lastPT - 20 + 'px';
				para.removeAttribute('mark-tag');
			}
			
			//标签删除后，需要重新绘制连线UI
			this.$refs['paraItem'][index].reDrawLines();
		},	
		//选择标签
		chooseTag(target, index){
            var classname = this.classname;
            var para = $(target).parents('.ts-entity-item')[0];
            //标签的选择跨段落，清空之前的pair
            if(index != this.lastIndex){
				this.clearPair();
			}
			if(target.classList.contains(classname)){
                target.classList.remove(classname);
                if(this.pair[0] && this.pair[0] == target){
                    this.pair.shift();
                }else if(this.pair[1] && this.pair[1] == target){
                    this.pair.pop();
				}
				this.$refs['paraItem'][index].unactiveLine();
            }else{
                target.classList.add(classname);
                this.pair.push(target);
                this.lastItem = para;//TODO:这个参数貌似没用了
				this.lastIndex = index;
				this.$refs['paraItem'][index].activeDotLinkLines(target);	
            }
            if(this.pair.length > 2){
				var item = this.pair.shift();
				item.classList.remove(classname);
			}
        },
        clearPair(){
            this.pair.forEach((item)=>{
                item.classList.remove(this.classname);
            });
            this.pair = [];
        },
        //添加关系连线
        markRel(item){
            if(this.pair.length != 2){
				this.$message.warning('关系连线需要点选两个实体标签');
				return;
            }
            this.$refs['paraItem'][this.lastIndex].setPairAndLink(this.pair, item);			
		},
		paraMarkCont(para){
			var childNodes = para.childNodes;
			var data = [];
			//cont：如下是对标注的文章内容生成data数据
            for(var item of childNodes){
                if(item.nodeType == 1 && item.tagName.toLowerCase() == 'span'){
                    var classid = $(item).data('id');
                    var text = $(item).find('b').text();
					var tag = $(item).find('em').text();
					var dot = $(item).data('dot');
					var color = $(item).data('color');
                    var content = `${text}/*-${classid}==${tag}==${dot}==${color}`;//这里是标签标注拼接的格式
                    item.textContent && data.push(content);
                }else if(item.nodeType == 3){
                    item.textContent && data.push(item.textContent + '/*-undefined');
                }
			}
			return data;
		}
    }
}