import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    // 这里可以集成Google Sheets API或其他服务
    // 示例：使用Google Apps Script Web App
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

    if (GOOGLE_SCRIPT_URL) {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        return NextResponse.json({ success: true });
      }
    }

    // 如果没有配置Google Script URL，返回成功（实际应该记录到数据库或文件）
    // 在生产环境中，应该使用Google Sheets API或数据库
    console.log('Form submission:', formData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing form:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

