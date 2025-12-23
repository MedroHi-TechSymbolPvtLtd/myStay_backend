import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { successResponse, errorResponse } from '../utils/response';

const adminService = new AdminService();

export const createAdmin = async (req: Request, res: Response) => {
    try {
        const result = await adminService.createAdmin(req.body);
        successResponse(res, result, 'Admin created successfully');
    } catch (error: any) {
        errorResponse(res, error.message, 400, error);
    }
};

export const listAdmins = async (req: Request, res: Response) => {
    try {
        const result = await adminService.listAdmins();
        successResponse(res, result);
    } catch (error: any) {
        errorResponse(res, error.message);
    }
};

export const updateAdminStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const result = await adminService.updateStatus(id, isActive);
        successResponse(res, result, 'Admin status updated');
    } catch (error: any) {
        errorResponse(res, error.message);
    }
};

export const updatePermissions = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await adminService.updatePermissions(id, req.body);
        successResponse(res, result, 'Permissions updated');
    } catch (error: any) {
        errorResponse(res, error.message);
    }
}
