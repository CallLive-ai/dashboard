'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { useTranslations } from '@/i18n/translations-context';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Contact } from '@/app/hooks/use-contacts';
import { Label } from '@/components/ui/label';
import { useContactsContext } from '../contexts/contacts-context';

interface CreateContactProps {
  onCancel: () => void;
  onSuccess?: (contact: Contact) => void;
}

// Validate phone number format
const validatePhoneNumber = (phone: string) => {
  const regex = /^\+[1-9]\d{1,14}$/;

  return regex.test(phone);
};

// Create a schema for form validation
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string()
    .min(1, 'Phone number is required')
    .refine(validatePhoneNumber, 'Phone number must include country code (e.g., +91234567890)'),
});

const CreateContact: React.FC<CreateContactProps> = ({ onCancel, onSuccess }) => {
  const { t } = useTranslations();
  const { selectedList, addContactToList } = useContactsContext();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validateForm = () => {
    try {
      contactSchema.parse({ name, phone });
      setErrors({});

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: { [k: string]: string } = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(formattedErrors);
      }

      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedList) {
      alert('Please select a contact list first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      // Await the result from the context function (now using localStorage)
      const newContact = await addContactToList(selectedList.id, { name, phone });

      // Check if contact creation was successful and call onSuccess with the actual contact
      if (newContact && onSuccess) {
        onSuccess(newContact);
      }
      // Optionally handle the case where newContact is null (creation failed)
      if (!newContact) {
        console.error("Failed to create contact in localStorage.");
        // Maybe show an error message to the user
        alert('Failed to save contact. Please try again.');
      }
    } catch (error) {
      console.error("Error submitting contact:", error);
      alert('An error occurred while saving the contact.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          {t('contacts.labels.name')} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder={t('contacts.placeholders.name')}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors(prev => ({ ...prev, name: undefined }));
          }}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          {t('contacts.labels.phoneNumber')} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          placeholder={t('contacts.placeholders.phoneNumber')}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setErrors(prev => ({ ...prev, phone: undefined }));
          }}
          className={errors.phone ? 'border-red-500' : ''}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm">{errors.phone}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {t('contacts.helperText.phoneNumber')}
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit">
          {t('contacts.addContact.title')}
        </Button>
      </div>
    </form>
  );
};

export default CreateContact;