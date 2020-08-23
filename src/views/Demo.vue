<template>

	<div class="ts-demo">
		<van-nav-bar title="标题" left-text="返回" left-arrow>
			<van-icon name="search" slot="right" />
		</van-nav-bar>
		<div class="ts-demo-cont">
			<p class="ts-demo-title">文字省略</p>
			<!-- 最多显示两行 -->
			<div class="van-multi-ellipsis--l2">这是一段最多显示两行的文字，后面的内容会省略。这是一段最多显示两行的文字，后面的内后面的内容会省略。这是一段最多显示两行的文字</div>
			<p class="ts-demo-title">按钮</p>
			<div>
				<van-button type="info">信息按钮</van-button>
			</div>
			<p class="ts-demo-title">弹出层</p>
			<div>
				<van-button type="primary" @click="showPopup=true">底部弹出</van-button>
			</div>
			<van-popup 
				v-model="showPopup"
				position="bottom"
				:style="{ height: '20%' }"
			>内容</van-popup>
			<p class="ts-demo-title">Toast提示</p>
			<div>
				<van-button type="danger" @click="showToast">提示</van-button>
			</div>

			<van-tabbar v-model="tabActive">
				<van-tabbar-item icon="home-o">标签</van-tabbar-item>
				<van-tabbar-item icon="search">标签</van-tabbar-item>
				<van-tabbar-item icon="friends-o" info="5">标签</van-tabbar-item>
				<van-tabbar-item icon="setting-o">标签</van-tabbar-item>
			</van-tabbar>

			<p class="ts-demo-title">tab-mobile插件</p>
		</div>
	</div>

</template>

<script>
import { 
	Tag,
	Button,
	Popup,
	Toast,
	NavBar,
	Icon,
	Tabbar, 
	TabbarItem

} from "vant";

export default {
	name: 'ts-demo',

	mixins: [],

	components: {
		[Tag.name]: Tag,
		[Button.name]: Button,
		[Popup.name]: Popup,
		[NavBar.name]: NavBar,
		[Icon.name]: Icon,
		[Tabbar.name]: Tabbar,
		[TabbarItem.name]: TabbarItem
	},

	props: {},

	data() {
		return {
			showPopup: false,
			tabActive: 0,

		};
	},

	computed: {},

	watch: {},

	created() {},

	mounted() {},

	destroyed() {},

	methods: {
		showToast(){
			Toast('提示内容');
		}
	}
};
</script>

<style lang="less">
.ts-demo {
	.ts-demo-cont{
		padding: 10px;
	}
	.ts-demo-title{
		font-size: 16px;
		font-weight: bold;
	}
}
</style>
