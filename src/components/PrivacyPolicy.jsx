/**
 * 隐私政策页面组件
 * 符合Google AdSense政策要求，明确说明数据收集、使用方式及第三方广告合作信息
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>隐私政策 - 装修知识思维导图</title>
        <meta name="description" content="装修知识思维导图的隐私政策，详细说明我们如何收集、使用和保护您的个人信息。" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px',
        lineHeight: '1.8',
        color: 'var(--color-text-primary, #333)',
        textAlign: 'left'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>隐私政策</h1>
        <p style={{ color: '#888', marginBottom: '32px' }}>最后更新日期：2026年6月7日</p>

        <p>欢迎访问装修知识思维导图（以下简称"本站"或"我们"）。我们深知个人信息对您的重要性，并承诺保护您的隐私。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的信息。</p>

        <h2>一、我们收集的信息</h2>

        <h3>1.1 您主动提供的信息</h3>
        <ul>
          <li><strong>账号信息：</strong>当您注册账号时，我们收集您的电子邮箱地址，用于账号创建和身份验证。</li>
          <li><strong>社区内容：</strong>当您在论坛发帖或评论时，我们会收集您发布的内容。</li>
          <li><strong>反馈信息：</strong>当您通过意见反馈功能联系我们时，我们会收集您提交的反馈内容和联系信息。</li>
        </ul>

        <h3>1.2 自动收集的信息</h3>
        <ul>
          <li><strong>日志信息：</strong>当您访问本站时，我们的服务器会自动记录您的浏览器发送的信息，包括IP地址、浏览器类型、访问时间、引用页面等。</li>
          <li><strong>Cookie及类似技术：</strong>我们使用Cookie和类似技术来提升用户体验、分析流量和提供个性化服务。您可以通过浏览器设置管理Cookie偏好。</li>
          <li><strong>设备信息：</strong>我们可能收集您使用的设备类型、操作系统版本和屏幕分辨率等信息，以优化网站显示效果。</li>
        </ul>

        <h2>二、我们如何使用信息</h2>
        <ul>
          <li><strong>提供服务：</strong>用于账号管理、内容展示、用户支持和系统维护。</li>
          <li><strong>改善体验：</strong>分析用户行为以优化网站功能和内容，提升用户体验。</li>
          <li><strong>安全保障：</strong>检测和防止欺诈、滥用和非法活动，保护用户和本站的安全。</li>
          <li><strong>通信联系：</strong>向您发送与服务相关的通知，如密码重置、重要更新等。</li>
        </ul>

        <h2>三、第三方服务与广告</h2>

        <h3>3.1 Google Analytics（分析）</h3>
        <p>本站使用Google Analytics来收集网站流量和使用数据。Google Analytics通过Cookie收集匿名信息，包括页面访问次数、访问时长和流量来源等。Google可能会根据其隐私政策使用这些数据。您可以通过安装<a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics退出浏览器插件</a>来选择退出。</p>

        <h3>3.2 Google AdSense（广告）</h3>
        <p>本站可能展示由Google AdSense提供的广告。Google AdSense使用Cookie来展示基于用户兴趣的广告。这些Cookie使Google及其合作伙伴能够根据您访问本站或其他网站的情况来展示广告。</p>
        <ul>
          <li>Google作为第三方供应商，使用Cookie在本站上展示广告。</li>
          <li>Google使用DART Cookie使其能够根据用户访问本站和互联网上其他网站的情况来展示广告。</li>
          <li>用户可以通过访问<a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google广告和内容网络隐私政策</a>来选择退出DART Cookie的使用。</li>
        </ul>

        <h3>3.3 Supabase</h3>
        <p>本站使用Supabase作为后端数据库服务，用于存储用户账号、论坛内容和反馈数据。Supabase会按照其隐私政策处理数据。详情请参见<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase隐私政策</a>。</p>

        <h2>四、Cookie政策</h2>
        <p>Cookie是网站存储在您设备上的小型文本文件。本站使用以下类型的Cookie：</p>
        <ul>
          <li><strong>必要Cookie：</strong>用于网站基本功能的运行，如用户登录状态的维护。</li>
          <li><strong>分析Cookie：</strong>用于分析网站流量和用户行为（通过Google Analytics）。</li>
          <li><strong>广告Cookie：</strong>用于展示个性化广告（通过Google AdSense）。</li>
          <li><strong>偏好Cookie：</strong>用于记住您的偏好设置，如主题颜色（亮色/暗色模式）。</li>
        </ul>
        <p>您可以通过浏览器设置来控制或删除Cookie。请注意，禁用某些Cookie可能会影响网站的正常功能。</p>

        <h2>五、数据存储与安全</h2>
        <p>我们采取合理的技术和管理措施来保护您的个人信息安全，防止未经授权的访问、使用或泄露。您的账号密码经过加密存储，我们不会以明文形式保存密码。</p>
        <p>您的数据存储在Supabase提供的云服务器上，Supabase采用行业标准的安全措施来保护数据。</p>

        <h2>六、信息的共享与披露</h2>
        <p>我们不会将您的个人信息出售给第三方。我们仅在以下情况下共享您的信息：</p>
        <ul>
          <li>获得您的明确同意。</li>
          <li>根据法律法规的要求或应政府机关的合法请求。</li>
          <li>为了保护本站的权利、财产或安全，以及用户或公众的安全。</li>
        </ul>

        <h2>七、您的权利</h2>
        <p>根据适用的数据保护法律，您可能拥有以下权利：</p>
        <ul>
          <li><strong>访问权：</strong>您可以请求获取我们持有的关于您的个人信息副本。</li>
          <li><strong>更正权：</strong>如果您的个人信息不准确或不完整，您可以请求更正。</li>
          <li><strong>删除权：</strong>在特定情况下，您可以请求删除您的个人信息。</li>
          <li><strong>数据可携权：</strong>您可以请求将您的数据以结构化、通用的格式转移给其他服务商。</li>
        </ul>
        <p>如您希望行使上述任何权利，请通过"联系我们"页面的方式与我们联系。</p>

        <h2>八、儿童隐私</h2>
        <p>本站不面向13岁以下的儿童，我们不会故意收集13岁以下儿童的个人信息。如果我们得知无意中收集了此类信息，将立即删除。</p>

        <h2>九、隐私政策的更新</h2>
        <p>我们可能会不时更新本隐私政策。更新后的版本将在本页面发布，并在顶部注明更新日期。我们建议您定期查阅本页面以了解最新信息。</p>

        <h2>十、联系我们</h2>
        <p>如果您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：</p>
        <ul>
          <li>邮箱：xiayiye580@gamil.com</li>
          <li>在线：访问本站的<a href="/contact">联系我们</a>页面提交您的反馈</li>
        </ul>

        <p style={{ marginTop: '40px', color: '#888', fontSize: '0.9rem' }}>
          装修知识思维导图 保留对本隐私政策的最终解释权。
        </p>
      </div>
    </>
  );
};

export default PrivacyPolicy;