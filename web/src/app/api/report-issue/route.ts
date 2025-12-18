import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, description } = body;

        if (!title || !description) {
            return NextResponse.json(
                { error: "Title and description are required" },
                { status: 400 }
            );
        }

        // Determine the path to the issues directory
        // Assuming process.cwd() is the 'web' folder, we need to go up one level
        const issuesDir = path.join(process.cwd(), "..", "issues");

        // Ensure directory exists (it should, but good practice)
        if (!fs.existsSync(issuesDir)) {
            fs.mkdirSync(issuesDir, { recursive: true });
        }

        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const safeTitle = title.replace(/[^a-z0-9]/gi, "_").toLowerCase().slice(0, 50);
        const filename = `issue_${timestamp}_${safeTitle}.md`;
        const filePath = path.join(issuesDir, filename);

        const fileContent = `# ${title}\n\n**Date:** ${new Date().toLocaleString()}\n\n## Description\n${description}\n`;

        fs.writeFileSync(filePath, fileContent);

        return NextResponse.json({ success: true, filename });
    } catch (error) {
        console.error("Failed to save issue:", error);
        return NextResponse.json(
            { error: "Failed to save issue report" },
            { status: 500 }
        );
    }
}
