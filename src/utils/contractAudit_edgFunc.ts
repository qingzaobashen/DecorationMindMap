/**
 * Supabase Edge Function: 合同审计功能
 * 功能：接收合同图片（支持单张或多张），调用 AI 接口进行合同识别和审计
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CONTRACT_AUDIT_PROMPT = `你是一个专业的合同审计 AI。请仔细分析上传的合同图片（共 {imageCount} 张），进行以下审计：

1. **合同基本信息识别**
   - 合同双方名称
   - 合同签订日期
   - 合同有效期
   - 合同金额（如有）

2. **关键条款审计**
   - 检查合同中的关键条款是否完整
   - 识别可能对用户不利的条款
   - 检查违约责任条款是否合理
   - 检查退款/退货条款

3. **风险识别**
   - 高风险问题（红色标记）：可能导致重大损失或法律风险
   - 中风险问题（黄色标记）：需要注意但不一定导致损失
   - 低风险问题（绿色标记）：建议改进但不影响基本权益

4. **审计结论**
   - 合同整体评分（1-10分）
   - 是否建议签署

请以 JSON 格式返回审计结果，格式如下：
{
  "summary": "总体审计结论（1-2句话）",
  "hasIssue": true/false,  // 是否有发现问题
  "overallScore": 8,  // 整体评分 1-10
  "imageCount": {imageCount},  // 分析的图片数量
  "issues": [
    {
      "severity": "high/medium/low",  // 严重程度
      "title": "问题标题",
      "description": "详细描述"
    }
  ],
  "suggestions": ["建议1", "建议2"]
}

请直接返回 JSON，不要包含其他文字。`;

serve(async (req) => {
  console.log('收到合同审计请求:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: '缺少授权头' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://uwgvflkueracnwgwdwpe.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: '无效的授权令牌' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let body;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      body = await req.json();
    }

    const { imageData, nodeText } = body;

    // 支持单张图片（字符串）和多张图片（数组）
    let imageArray: string[] = [];
    if (typeof imageData === 'string') {
      // 单张图片
      imageArray = [imageData];
    } else if (Array.isArray(imageData)) {
      // 多张图片
      imageArray = imageData.filter(img => typeof img === 'string' && img.length > 0);
    }

    if (imageArray.length === 0) {
      return new Response(JSON.stringify({ error: '缺少合同图片' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('审计请求数据:', {
      imageCount: imageArray.length,
      nodeText: nodeText,
      imagePreview: imageArray.map((_, i) => `[图片${i + 1}]`)
    });

    // 获取 AI API 配置
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    const openRouterApiUrl = Deno.env.get('OPENROUTER_API_URL') || 'https://openrouter.ai/api/v1/chat/completions';

    if (!openRouterApiKey) {
      // 如果没有配置 API Key，返回模拟数据用于测试
      console.log('未配置 AI API Key，返回模拟审计结果');
      const mockResult = {
        summary: `这是一份装修合同样例（收到 ${imageArray.length} 张图片），实际使用时请配置 AI API Key`,
        hasIssue: true,
        overallScore: 7,
        imageCount: imageArray.length,
        issues: [
          {
            severity: 'medium',
            title: '建议补充具体材料品牌',
            description: '合同中未明确指定装修材料的具体品牌，建议补充以避免后期纠纷'
          },
          {
            severity: 'low',
            title: '建议明确付款节点',
            description: '建议将付款节点与施工进度挂钩，分阶段付款更能保障双方权益'
          }
        ],
        suggestions: [
          '签署前请仔细阅读所有条款',
          '建议保留一份合同原件',
          '可以在签署前拍照留档'
        ]
      };

      return new Response(JSON.stringify({
        success: true,
        data: mockResult
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 构建 AI 请求内容 - 多图支持
    const contentArray: any[] = [
      {
        type: 'text',
        text: CONTRACT_AUDIT_PROMPT.replace('{imageCount}', imageArray.length.toString())
      }
    ];

    // 添加所有图片
    for (const img of imageArray) {
      contentArray.push({
        type: 'image_url',
        image_url: {
          url: img
        }
      });
    }

    // 调用 AI 接口进行审计
    const aiResponse = await fetch(openRouterApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku-20241107',
        messages: [
          {
            role: 'user',
            content: contentArray
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API 调用失败:', aiResponse.status, errorText);
      throw new Error(`AI API 调用失败: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI 响应:', aiData);

    const assistantMessage = aiData.choices?.[0]?.message?.content;
    if (!assistantMessage) {
      throw new Error('AI 未返回有效响应');
    }

    // 解析 AI 返回的 JSON
    let auditResult;
    try {
      // 尝试提取 JSON（可能有 markdown 格式）
      const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        auditResult = JSON.parse(jsonMatch[0]);
      } else {
        auditResult = JSON.parse(assistantMessage);
      }
    } catch (parseError) {
      console.error('解析 AI 响应失败:', parseError);
      // 返回原始文本作为结果
      auditResult = {
        summary: 'AI 响应解析失败，请稍后再试',
        hasIssue: false,
        overallScore: 5,
        imageCount: imageArray.length,
        issues: [],
        suggestions: ['请稍后重试或联系客服'],
        rawResponse: assistantMessage
      };
    }

    // 确保审计结果包含图片数量
    auditResult.imageCount = imageArray.length;

    // 保存审计记录到数据库
    try {
      await supabase
        .from('contract_audits')
        .insert({
          user_id: user.id,
          user_email: user.email,
          node_text: nodeText || '',
          image_data: JSON.stringify(imageArray.map(img => img.substring(0, 100))),
          audit_result: auditResult,
          created_at: new Date().toISOString()
        });
    } catch (dbError) {
      console.error('保存审计记录失败:', dbError);
      // 不影响返回结果
    }

    return new Response(JSON.stringify({
      success: true,
      data: auditResult
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('合同审计失败:', error);
    return new Response(JSON.stringify({
      success: false,
      message: error.message || '合同审计失败，请稍后再试'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
