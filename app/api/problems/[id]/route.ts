import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// 更新问题
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = params;
    const data = await req.json();

    // 验证问题属于当前用户
    const problem = await prisma.problem.findUnique({
      where: { id },
    });

    if (!problem || problem.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Problem not found or access denied" },
        { status: 404 }
      );
    }

    const updatedProblem = await prisma.problem.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedProblem);
  } catch (error) {
    console.error("Error updating problem:", error);
    return NextResponse.json(
      { error: "Failed to update problem" },
      { status: 500 }
    );
  }
}

// 删除问题
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = params;

    // 验证问题属于当前用户
    const problem = await prisma.problem.findUnique({
      where: { id },
    });

    if (!problem || problem.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Problem not found or access denied" },
        { status: 404 }
      );
    }

    await prisma.problem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting problem:", error);
    return NextResponse.json(
      { error: "Failed to delete problem" },
      { status: 500 }
    );
  }
} 