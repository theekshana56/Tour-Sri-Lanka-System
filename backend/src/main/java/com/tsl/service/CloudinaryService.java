package com.tsl.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image"));
        return (String) result.get("secure_url");
    }

    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception ex) {
            log.warn("Failed to delete Cloudinary image: {}", publicId, ex);
        }
    }

    public String uploadPdf(byte[] pdfBytes, String filename) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(pdfBytes, ObjectUtils.asMap(
                    "folder", "tsl/documents",
                    "resource_type", "raw",
                    "public_id", filename.replace(".pdf", "")));
            return (String) result.get("secure_url");
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to upload PDF to Cloudinary", ex);
        }
    }

    public String extractPublicId(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("/upload/")) {
            return null;
        }
        String afterUpload = imageUrl.substring(imageUrl.indexOf("/upload/") + 8);
        if (afterUpload.startsWith("v")) {
            afterUpload = afterUpload.substring(afterUpload.indexOf('/') + 1);
        }
        int dotIndex = afterUpload.lastIndexOf('.');
        return dotIndex > 0 ? afterUpload.substring(0, dotIndex) : afterUpload;
    }
}
