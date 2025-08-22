import { NextRequest, NextResponse } from "next/server";
import { vtonProcessor } from "../../../lib/vtonProcessor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { personImage, clothImage } = body;

    const result = await vtonProcessor(personImage, clothImage);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("VTON route error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", detail: error?.message },
      { status: 500 }
    );
  }
}
