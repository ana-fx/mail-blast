# Email HTML Examples

Contoh HTML email yang siap digunakan untuk mode HTML di Email Content Editor.

## Contoh 1: Email Sederhana dengan Header dan Footer (Dengan Gambar)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header dengan Logo -->
          <tr>
            <td style="background-color: #1e293b; padding: 30px; text-align: center;">
              <img src="https://via.placeholder.com/200x60/ffffff/1e293b?text=MailBlast+Logo" alt="MailBlast Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 20px;">Hello!</h2>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                This is a sample email template. You can customize this content to match your brand and message.
              </p>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 20px 0;">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; padding: 12px 30px; background-color: #1e293b; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold;">Call to Action</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer dengan Logo -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <img src="https://via.placeholder.com/150x40/64748b/f1f5f9?text=Footer+Logo" alt="Footer Logo" style="max-width: 150px; height: auto; display: block; margin: 0 auto 15px;">
              <p style="color: #64748b; font-size: 12px; margin: 5px 0;">
                © 2024 MailBlast. All rights reserved.
              </p>
              <p style="color: #64748b; font-size: 12px; margin: 5px 0;">
                <a href="#" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> | 
                <a href="#" style="color: #64748b; text-decoration: underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Contoh 2: Email dengan 2 Kolom (Product/Feature)

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to Our Newsletter</h1>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1e293b; margin-top: 0;">Featured Products</h2>
              
              <!-- Two Column Layout -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td width="48%" valign="top" style="padding-right: 2%;">
                    <img src="https://via.placeholder.com/250x150" alt="Product 1" style="width: 100%; max-width: 250px; height: auto; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="color: #1e293b; font-size: 18px; margin: 10px 0;">Product Name</h3>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 10px 0;">
                      Product description goes here. This is a brief overview of what the product offers.
                    </p>
                    <a href="#" style="color: #667eea; text-decoration: none; font-weight: bold;">Learn More →</a>
                  </td>
                  <td width="48%" valign="top" style="padding-left: 2%;">
                    <img src="https://via.placeholder.com/250x150" alt="Product 2" style="width: 100%; max-width: 250px; height: auto; border-radius: 8px; margin-bottom: 15px;">
                    <h3 style="color: #1e293b; font-size: 18px; margin: 10px 0;">Product Name</h3>
                    <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 10px 0;">
                      Product description goes here. This is a brief overview of what the product offers.
                    </p>
                    <a href="#" style="color: #667eea; text-decoration: none; font-weight: bold;">Learn More →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin: 5px 0;">
                You're receiving this email because you subscribed to our newsletter.
              </p>
              <p style="color: #64748b; font-size: 12px; margin: 5px 0;">
                <a href="#" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Contoh 3: Email Minimalis Modern

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0">
          <!-- Content -->
          <tr>
            <td style="padding: 60px 40px;">
              <h1 style="color: #0f172a; margin: 0 0 20px 0; font-size: 32px; font-weight: 700; line-height: 1.2;">
                Simple & Clean
              </h1>
              <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                This is a minimal email template. Clean design, easy to read, and professional.
              </p>
              <p style="color: #475569; font-size: 16px; line-height: 1.8; margin: 0 0 40px 0;">
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              
              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin: 0;">
                <tr>
                  <td style="background-color: #0f172a; border-radius: 6px;">
                    <a href="#" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px;">
                      Get Started
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;">
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 10px 0;">
                MailBlast Email Marketing
              </p>
              <p style="color: #cbd5e1; font-size: 12px; margin: 0;">
                <a href="#" style="color: #cbd5e1; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Contoh 4: Email dengan List/Bullet Points

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 30px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #3b82f6; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 26px;">Important Updates</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">What's New</h2>
              
              <ul style="color: #475569; font-size: 16px; line-height: 1.8; padding-left: 20px; margin: 20px 0;">
                <li style="margin-bottom: 15px;">
                  <strong style="color: #1e293b;">New Feature:</strong> Enhanced email tracking and analytics
                </li>
                <li style="margin-bottom: 15px;">
                  <strong style="color: #1e293b;">Improvement:</strong> Faster email delivery with optimized infrastructure
                </li>
                <li style="margin-bottom: 15px;">
                  <strong style="color: #1e293b;">Update:</strong> New email templates available in the template library
                </li>
                <li style="margin-bottom: 15px;">
                  <strong style="color: #1e293b;">Security:</strong> Enhanced security measures for better protection
                </li>
              </ul>
              
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 30px 0;">
                Thank you for being a valued customer. We're constantly working to improve our service.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 40px; text-align: center;">
              <p style="color: #64748b; font-size: 12px; margin: 5px 0;">
                © 2024 MailBlast. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Tips untuk HTML Email:

1. **Gunakan Table Layout**: Email clients tidak support CSS Grid/Flexbox dengan baik, gunakan `<table>` untuk layout
2. **Inline Styles**: Selalu gunakan inline CSS, jangan gunakan `<style>` tag
3. **Width**: Gunakan fixed width (600px) untuk desktop, max-width 100% untuk mobile
4. **Colors**: Gunakan hex colors (#ffffff), bukan named colors
5. **Images**: 
   - Gunakan absolute URLs dengan `https://` untuk images (contoh: `https://via.placeholder.com/200x60`)
   - Pastikan URL gambar dapat diakses dari browser
   - Atribut `referrerpolicy` dan `crossorigin` akan ditambahkan otomatis oleh sistem untuk memastikan gambar dapat dimuat dengan benar
   - Untuk preview, gunakan URL gambar yang valid (bukan `http://` karena akan diblokir oleh mixed content policy)
6. **Fonts**: Gunakan web-safe fonts (Arial, Helvetica, sans-serif)
7. **Testing**: Test di berbagai email clients (Gmail, Outlook, Apple Mail)
8. **Preview**: Gambar akan otomatis di-render dengan benar di preview modal, pastikan URL gambar menggunakan HTTPS

## Template Minimal dengan Gambar (Copy-Paste Ready):

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
          <!-- Header dengan Logo -->
          <tr>
            <td style="background-color: #1e293b; padding: 30px; text-align: center;">
              <img src="https://mbaktutik.com/images/logo/TYPOGRAPHY-MBAKTUTIK-BLACK.png" alt="Logo" style="max-width: 200px; height: auto; display: block; margin: 0 auto;">
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="color: #1e293b; margin: 0 0 20px 0;">Your Title Here</h1>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your content goes here. This is a simple email template with images in header and footer.
              </p>
              <a href="#" style="display: inline-block; padding: 12px 24px; background-color: #1e293b; color: #ffffff; text-decoration: none; border-radius: 6px; margin-top: 20px;">
                Button Text
              </a>
            </td>
          </tr>
          
          <!-- Footer dengan Logo -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <img src="https://mbaktutik.com/images/logo/TYPOGRAPHY-MBAKTUTIK-BLACK.png" alt="Footer Logo" style="max-width: 150px; height: auto; display: block; margin: 0 auto 15px;">
              <p style="color: #64748b; font-size: 12px; margin: 5px 0;">
                © 2024 Your Company. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

