class BrowserCodecSupport {
    constructor() {
        this.supportedCodecs = [];
        this.unsupportedCodecs = [];
    }

    checkAllCommonCodecs() {
        const codecsToCheck = [
            { name: 'H.264 Baseline', codec: 'avc1.42E01E' },
            { name: 'H.264 Main', codec: 'avc1.4D401E' },
            { name: 'H.264 High', codec: 'avc1.64001E' },
            { name: 'H.265 (HEVC)', codec: 'hev1.1.6.L93.B0' },
            { name: 'VP8', codec: 'vp8' },
            { name: 'VP9', codec: 'vp9' },
            { name: 'AV1', codec: 'av01.0.04M.08' }
        ];

        codecsToCheck.forEach(({ name, codec }) => {
            const supportLevel = this.checkCodecSupport(codec);
            if (supportLevel !== '') {
                this.supportedCodecs.push({ name, codec, supportLevel });
            } else {
                this.unsupportedCodecs.push({ name, codec });
            }
        });

        return {
            supported: this.supportedCodecs,
            unsupported: this.unsupportedCodecs
        };
    }

    checkCodecSupport(codec) {
        const video = document.createElement('video');
        const mimeType = `video/mp4; codecs="${codec}"`;
        return video.canPlayType(mimeType);
    }

    generateSupportReport() {
        const report = this.checkAllCommonCodecs();
        
        console.log('=== 浏览器视频编码支持报告 ===');
        console.log('支持的编码格式:');
        report.supported.forEach(item => {
            console.log(`  ${item.name}: ${item.supportLevel}`);
        });
        
        console.log('不支持的编码格式:');
        report.unsupported.forEach(item => {
            console.log(`  ${item.name}`);
        });

        return report;
    }
}

const supportChecker = new BrowserCodecSupport();
const report = supportChecker.generateSupportReport();