import useDeviceConfig from "@/components/useDeviceConfig";
import { modeAtom } from "@/stateV2/mode";
import { sleep } from "@/utils";
import { CameraOutlined } from "@ant-design/icons";
import { App, Button, type ButtonProps } from "antd";
import { saveAs } from "file-saver";
import { useSetAtom } from "jotai";
import { noop } from "lodash-es";
import { browserName, browserVersion } from "react-device-detect";
import { checkCanDirectCreateScreenshot, drawToCanvas } from "./utils";

type Props = {
	buttonProps?: ButtonProps;
};

const ScreenshotButton = ({ buttonProps }: Props) => {
	const { message } = App.useApp();
	const { screenSize } = useDeviceConfig();
	const setMode = useSetAtom(modeAtom);

	/**
	 * 创建截图的处理函数
	 * 流程：切换预览模式 -> 检查浏览器兼容性 -> 获取屏幕流 -> 裁剪区域 -> 生成截图 -> 下载
	 */
	const handleCreateScreenshot = async () => {
		// 切换到预览模式，隐藏编辑工具栏等 UI 元素
		setMode("preview");

		// 检查当前浏览器是否支持直接截图功能
		try {
			checkCanDirectCreateScreenshot({
				browserName,
				browserVersion,
			});
		} catch (e: any) {
			message.error(e?.message);
		}

		// 请求屏幕共享权限，获取媒体流
		// preferCurrentTab: true 建议浏览器优先选择当前标签页
		const stream = await navigator.mediaDevices
			.getDisplayMedia({
				video: true,
				audio: false,
				preferCurrentTab: true,
			})
			.catch(noop);
		if (!stream) return;

		// 等待 UI 渲染稳定（切换到预览模式后的动画和布局调整）
		await sleep(700);

		// 获取需要截图的目标元素
		const screenElement = document.querySelector("#screen") as HTMLDivElement;

		// 如果窗口高度小于设备尺寸，调整元素高度以适应视口
		const innerHeight = window.innerHeight;
		if (innerHeight < screenSize.height) {
			screenElement.style.height = `${innerHeight}px`;
		}

		// 使用 Region Capture API 将视频流裁剪到目标元素边界
		const [videoTrack] = stream.getVideoTracks();
		const cropTarget = await CropTarget.fromElement(screenElement);
		await videoTrack.cropTo(cropTarget);

		// 将视频流绘制到 canvas 上
		const canvas = await drawToCanvas(stream);

		// 将 canvas 转换为 blob 并下载，完成后停止视频轨道并刷新页面
		canvas.toBlob((blob) => {
			saveAs(blob!, "screenshot.png");
			videoTrack.stop();
			location.reload();
		});
	};

	return <Button onClick={handleCreateScreenshot} icon={<CameraOutlined />} {...buttonProps} />;
};

export default ScreenshotButton;
