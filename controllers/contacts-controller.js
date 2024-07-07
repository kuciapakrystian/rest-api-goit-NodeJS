import { HttpError } from "../helpers/index.js";
import { ctrlWrapper } from "../decorators/index.js";
import Contact from "../models/Contact.js";

async function getAllContacts(req, res, next) {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  const contacts = await Contact.find({ owner }, "-createdAt -updatedAt", {
    skip,
    limit,
  }).populate("owner", "email");

  if (!contacts) {
    throw HttpError(404, "No contacts found");
  }

  const sortedContacts = [...contacts].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const filteredContacts = [...sortedContacts].sort(
    (a, b) => b.favorite - a.favorite
  );

  res.json(filteredContacts);
}

async function getContactsById(req, res, next) {
  const { contactId: _id } = req.params;
  const { _id: owner } = req.user;
  const contactById = await Contact.findOne({ _id, owner });
  if (contactById) {
    res.json(contactById);
  } else {
    throw HttpError(404, "Contact not found");
  }
}

async function addNewContact(req, res, next) {
  const { _id: owner } = req.user;
  const newContact = await Contact.create({ ...req.body, owner });
  res.status(201).json(newContact);
}

async function deleteContact(req, res, next) {
  const { contactId: _id } = req.params;
  const { _id: owner } = req.user;
  const deleteContact = await Contact.findOneAndDelete({ _id, owner });
  if (deleteContact) {
    res.json({ message: "contact deleted" });
  } else {
    throw HttpError(404);
  }
}

async function editContact(req, res, next) {
  const { contactId: _id } = req.params;
  const { _id: owner } = req.user;
  const updatedContact = await Contact.findOneAndUpdate(
    { _id, owner },
    req.body,
    {
      new: true,
    }
  );
  if (!updatedContact) {
    throw HttpError(404, "Not found");
  }
  res.json(updatedContact);
}

async function updateContact(req, res, next) {
  const { contactId: _id } = req.params;
  const { _id: owner } = req.user;
  const updatedContact = await Contact.findOneAndUpdate(
    { _id, owner },
    req.body,
    {
      new: true,
    }
  );

  if (!updatedContact) {
    throw HttpError(404, "Not found");
  }

  res.json(updatedContact);
}

export default {
  getAllContacts: ctrlWrapper(getAllContacts),
  getContactsById: ctrlWrapper(getContactsById),
  addNewContact: ctrlWrapper(addNewContact),
  deleteContact: ctrlWrapper(deleteContact),
  editContact: ctrlWrapper(editContact),
  updateContact: ctrlWrapper(updateContact),
};