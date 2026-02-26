import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_PATH = path.join(__dirname, "storage");

/**
 * Asegura que la carpeta de almacenamiento exista.
 */
async function ensureStorage() {
    await fs.ensureDir(STORAGE_PATH);
}

/**
 * Guarda un proyecto de branding completo en el almacenamiento del backend.
 * @param {Object} project El proyecto a guardar.
 */
export async function saveProject(project) {
    await ensureStorage();
    const projectPath = path.join(STORAGE_PATH, project.id);
    const imagesPath = path.join(projectPath, "images");

    await fs.ensureDir(imagesPath);

    // Helper para guardar una imagen base64 y devolver su nueva URL
    const saveImage = async (base64Data, prefix) => {
        if (!base64Data || !base64Data.startsWith("data:image")) return base64Data;

        try {
            const buffer = Buffer.from(base64Data.split(",")[1], "base64");
            const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}.png`;
            await fs.writeFile(path.join(imagesPath, fileName), buffer);
            return `/api/projects/${project.id}/images/${fileName}`;
        } catch (e) {
            console.error(`Error saving image ${prefix}:`, e);
            return base64Data;
        }
    };

    // Procesar branding principal si existe
    if (project.branding) {
        // Guardar Logo Principal
        if (project.branding.logo) {
            project.branding.logo = await saveImage(project.branding.logo, "logo_main");
        }

        // Guardar Iconos Principales
        if (project.branding.icons && Array.isArray(project.branding.icons)) {
            for (let i = 0; i < project.branding.icons.length; i++) {
                project.branding.icons[i].svg = await saveImage(project.branding.icons[i].svg, `icon_main_${i}`);
            }
        }

        // Procesar logos e iconos dentro de cada propuesta
        if (project.branding.proposals && Array.isArray(project.branding.proposals)) {
            for (let i = 0; i < project.branding.proposals.length; i++) {
                const proposal = project.branding.proposals[i];
                if (proposal.logo) {
                    proposal.logo = await saveImage(proposal.logo, `logo_prop_${i}`);
                }
                if (proposal.icons && Array.isArray(proposal.icons)) {
                    for (let j = 0; j < proposal.icons.length; j++) {
                        proposal.icons[j].svg = await saveImage(proposal.icons[j].svg, `icon_prop_${i}_${j}`);
                    }
                }
            }
        }
    }

    // Compatibilidad por si acaso vienen en el raíz (aunque según los tipos están en branding)
    if (project.logo && project.logo.startsWith("data:image")) {
        project.logo = await saveImage(project.logo, "logo_root");
    }

    // Guardar el JSON del proyecto (ahora mucho más ligero sin los base64)
    await fs.writeJson(path.join(projectPath, "branding.json"), project, { spaces: 2 });

    return project;
}

/**
 * Obtiene todos los proyectos guardados.
 */
export async function getProjects() {
    await ensureStorage();
    const dirs = await fs.readdir(STORAGE_PATH);
    const projects = [];

    for (const id of dirs) {
        const projectFile = path.join(STORAGE_PATH, id, "branding.json");
        if (await fs.pathExists(projectFile)) {
            const project = await fs.readJson(projectFile);
            projects.push(project);
        }
    }

    return projects;
}

/**
 * Obtiene un proyecto específico por ID.
 */
export async function getProjectById(id) {
    const projectFile = path.join(STORAGE_PATH, id, "branding.json");
    if (await fs.pathExists(projectFile)) {
        return await fs.readJson(projectFile);
    }
    return null;
}

/**
 * Elimina un proyecto.
 */
export async function deleteProject(id) {
    const projectPath = path.join(STORAGE_PATH, id);
    if (await fs.pathExists(projectPath)) {
        await fs.remove(projectPath);
        return true;
    }
    return false;
}

/**
 * Devuelve la ruta física de una imagen.
 */
export function getImagePhysicalPath(projectId, imageName) {
    return path.join(STORAGE_PATH, projectId, "images", imageName);
}
