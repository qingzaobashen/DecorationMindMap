/**
 * 关于我们页面组件
 * 详细介绍网站运营主体、内容定位及运营理念，符合Google AdSense内容政策要求
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';

const AboutUs = () => {
  return (
    <>
      <Helmet>
        <title>关于我们 - 装修知识思维导图</title>
        <meta name="description" content="了解装修知识思维导图 - 一个致力于为装修业主提供专业、系统、可视化的装修知识平台。涵盖装修流程、材料选购、施工标准等全方位装修指南。" />
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
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>关于我们</h1>
        <p style={{ color: '#888', marginBottom: '32px' }}>专业、系统、可视化的装修知识平台</p>

        <h2>我们的使命</h2>
        <p>
          装修知识思维导图（decoration.qingzao.site）是一个专注于装修领域的专业知识平台。我们的使命是：<strong>让每一位装修业主都能轻松获取专业、系统、易懂的装修知识，用知识武装自己，让装修不再是一道难题</strong>。
        </p>
        <p>
          装修是人生中的大事，涉及的知识面广泛而复杂——从装修流程规划、预算编制、装修公司挑选，到材料选购、施工验收，每一个环节都需要专业知识支撑。然而，传统的信息获取方式往往碎片化、不系统，导致许多业主在装修过程中踩坑、超预算、甚至遭遇质量问题。
        </p>

        <h2>我们做什么</h2>
        <p>我们通过以下方式为装修业主提供价值：</p>
        <ul>
          <li>
            <strong>思维导图可视化：</strong>将复杂的装修知识以思维导图的形式直观呈现，帮助用户快速建立装修知识的整体框架，一目了然地了解装修全流程。
          </li>
          <li>
            <strong>系统化的知识文档：</strong>提供涵盖装修预算规划、装修公司挑选、设计概览、材料选购、施工标准等全方位文档，每一篇都经过精心整理和编排。
          </li>
          <li>
            <strong>图文并茂的实景指导：</strong>配有大量装修实景图片，从收房验房到主材安装，从水电施工到全屋定制，让您在装修前就能了解每个环节的实际情况。
          </li>
          <li>
            <strong>装修社区交流：</strong>不仅提供知识，还搭建了装修爱好者交流社区，让用户可以分享经验、交流心得、互相帮助。
          </li>
        </ul>

        <h2>内容定位</h2>
        <p>本站的内容覆盖装修全生命周期的各个阶段，包括但不限于：</p>
        <ul>
          <li><strong>装修入门：</strong>装修三大阶段、硬装五大工序、自行设计要点、预算编制方法</li>
          <li><strong>收房验房：</strong>三书一证一表、验房必备工具、验房流程详解</li>
          <li><strong>设计规划：</strong>设计方案制定、空间布局优化、装修风格选择</li>
          <li><strong>施工标准：</strong>水电施工规范、泥工工艺要求、木工制作标准、油工施工流程</li>
          <li><strong>材料选购：</strong>瓷砖挑选、地板选购、卫浴材料、厨房材料、净水器、空调、地暖等</li>
          <li><strong>全屋定制：</strong>橱柜定制、衣柜设计、收纳方案</li>
          <li><strong>主材安装：</strong>各类主材的安装规范和验收标准</li>
          <li><strong>入住准备：</strong>环保检测、家具选购、搬家入住</li>
        </ul>

        <h2>运营理念</h2>
        <p><strong>专业为本：</strong>我们的内容力求专业、准确，持续参考行业标准和最佳实践进行更新和完善。</p>
        <p><strong>用户至上：</strong>一切功能和内容的出发点都是为了让用户更轻松地掌握装修知识，完成满意的装修。</p>
        <p><strong>开放共享：</strong>我们相信知识应该被共享。本站核心知识内容免费向所有用户开放，让更多人受益。</p>
        <p><strong>持续改进：</strong>我们重视每一位用户的反馈，不断优化网站功能、完善知识内容、提升使用体验。</p>

        <h2>联系我们</h2>
        <p>我们非常重视您的意见和建议。如果您在使用过程中有任何问题、建议或合作意向，欢迎通过以下方式与我们取得联系：</p>
        <ul>
          <li>邮箱：xiayiye580@gamil.com</li>
          <li>在线：访问<a href="/contact">联系我们</a>页面提交反馈</li>
        </ul>

        <p style={{ marginTop: '40px', color: '#888', fontSize: '0.9rem' }}>
          感谢您选择装修知识思维导图，愿我们的努力能帮您打造理想的家！
        </p>
      </div>
    </>
  );
};

export default AboutUs;