import * as ownerService from '.././services/owner.service.js'
import ApiResponse from '../../../common/utils/api-response.js'

const createOwner = async (req,res) => {
    const owner = await ownerService.createOwner(req.body)
    ApiResponse.created(res, "Owner Created Successfully", owner)
}

const getAllOwners = async (req, res) => {
    const owners = await ownerService.getAllOwners();
    ApiResponse.ok(res, "Owners Fetched Successfully", owners);
};

const getOwnerById = async (req, res) => {
    const owner = await ownerService.getOwnerById(req.params.id);
    ApiResponse.ok(res, "Owner Fetched Successfully", owner);
};

const updateOwner = async (req, res) => {
    const updatedOwner = await ownerService.updateOwner(req.params.id, req.body);
    ApiResponse.ok(res, "Owner Updated Successfully", updatedOwner);
};

const deleteOwner = async (req, res) => {
    await ownerService.deleteOwner(req.params.id);
    ApiResponse.ok(res, "Owner Deleted Successfully");
};

export { createOwner, getAllOwners, getOwnerById, updateOwner, deleteOwner };