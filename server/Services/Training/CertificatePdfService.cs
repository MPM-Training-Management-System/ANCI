
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QRCoder;
using server.Services.Interfaces;

namespace server.Services;

public class CertificatePdfService : ICertificatePdfService
{
    private const string Blue = "#0038A8";
    private const string Red = "#CE1126";
    private const string Dark = "#172B4D";
    private const string Gray = "#5B6573";

    public async Task<Stream> GenerateAsync(
        string participantName,
        string trainingName,
        string batchCode,
        string certificateNumber,
        DateTime issuedAt,
        string verificationCode,
        string certificateType)
    {
        var stream = new MemoryStream();

        var isCompletion = string.Equals(
            certificateType,
            "Completion",
            StringComparison.OrdinalIgnoreCase);

        var title = isCompletion
            ? "CERTIFICATE OF COMPLETION"
            : "CERTIFICATE OF PARTICIPATION";

        // Replace with your deployed API URL before production.
        var verificationUrl =
            $"http://localhost:5296/api/certificate/verify/{Uri.EscapeDataString(verificationCode)}";

        using var qrGenerator = new QRCodeGenerator();

        using var qrData = qrGenerator.CreateQrCode(
            verificationUrl,
            QRCodeGenerator.ECCLevel.Q);

        var qrBytes = new PngByteQRCode(qrData).GetGraphic(8);

        // Optional transparent watermark image.
        // Expected path:
        // server/wwwroot/images/ace-icon-watermark.png
        var watermarkPath = Path.Combine(
            AppContext.BaseDirectory,
            "wwwroot",
            "images",
            "ace-icon-watermark.png");

        byte[]? watermarkBytes = File.Exists(watermarkPath)
            ? await File.ReadAllBytesAsync(watermarkPath)
            : null;

        // Replace with the actual authorized signatories.
        const string firstSignatoryName = "Antonio T. Ortega";
        const string firstSignatoryPosition = "President & Excutive Director";

        const string secondSignatoryName = "Dr. Danilo J. Carandang";
        const string secondSignatoryPosition = "Chairman";

        Document.Create(document =>
        {
            document.Page(page =>
            {
                page.Size(PageSizes.A4.Landscape());
                page.Margin(24);
                page.PageColor(Colors.White);

                page.DefaultTextStyle(style =>
                    style.FontFamily("Lato")
                        .FontColor(Dark));

                page.Content().Layers(layers =>
                {
                    // BACKGROUND WATERMARK
                    if (watermarkBytes != null)
                    {
                        layers.Layer()
                            .AlignCenter()
                            .AlignTop()
                            .PaddingTop(25)
                            .Width(480)
                            .Height(480)
                            .Image(watermarkBytes)
                            .FitArea();
                    }

                    // MAIN CERTIFICATE CONTENT
                    layers.PrimaryLayer()
                        .Border(3)
                        .BorderColor(Blue)
                        .Padding(5)
                        .Border(1)
                        .BorderColor("#8AADE0")
                        .Padding(22)
                        .Column(column =>
                        {
                            column.Spacing(5);

                            // COMPANY BRANDING
                            column.Item()
                                .AlignCenter()
                                .Text("ACE NEXTGEN")
                                .FontSize(25)
                                .Bold()
                                .FontColor(Blue);

                            column.Item()
                                .AlignCenter()
                                .Text("CONSULTANCY INC.")
                                .FontSize(12)
                                .SemiBold()
                                .FontColor(Red);

                            column.Item()
                                .PaddingTop(2)
                                .AlignCenter()
                                .Text(
                                    "PROFESSIONAL TRAINING AND DEVELOPMENT")
                                .FontSize(8)
                                .FontColor(Blue);

                            column.Item()
                                .PaddingTop(3)
                                .AlignCenter()
                                .Width(160)
                                .LineHorizontal(1.5f)
                                .LineColor(Red);

                            // CERTIFICATE TITLE
                            column.Item()
                                .PaddingTop(5)
                                .AlignCenter()
                                .Text(title)
                                .FontSize(22)
                                .Bold()
                                .FontColor(Blue);

                            column.Item()
                                .PaddingTop(4)
                                .AlignCenter()
                                .Text(
                                    "This certificate is proudly presented to")
                                .FontSize(11)
                                .FontColor(Gray);

                            // PARTICIPANT NAME
                            column.Item()
                                .PaddingTop(2)
                                .AlignCenter()
                                .Text(participantName)
                                .FontSize(26)
                                .Bold()
                                .FontColor(Dark);

                            column.Item()
                                .PaddingTop(2)
                                .AlignCenter()
                                .Width(500)
                                .LineHorizontal(1)
                                .LineColor(Blue);

                            // RECOGNITION SENTENCE
                            // Training name and batch are part of the sentence.
                           
column.Item()
    .PaddingTop(7)
    .PaddingHorizontal(18)
    .AlignCenter()
    .DefaultTextStyle(style => style
        .FontSize(11)
        .FontColor(Dark))
    .Text(text =>
    {
        if (isCompletion)
        {
            text.Span(
                "In recognition of the successful completion of the training program entitled ");
        }
        else
        {
            text.Span(
                "In recognition of their active participation in the training program entitled ");
        }

        text.Span(trainingName)
            .Bold()
            .FontColor(Blue);

        text.Span(
            $", under {batchCode}, organized and conducted by ACE NextGen Consultancy Inc.");

        if (isCompletion)
        {
            text.Span(
                ", having fulfilled the applicable training requirements and demonstrated commitment to acquiring the knowledge and skills covered by the program.");
        }
        else
        {
            text.Span(
                ", recognizing their commitment to learning, professional development, and the enhancement of their knowledge and skills relevant to the training subject.");
        }
    });


                            // AWARD DATE
                            column.Item()
                                .PaddingTop(7)
                                .AlignCenter()
                                .Text(
                                    $"Given this {issuedAt.Day}{GetOrdinalSuffix(issuedAt.Day)} day of {issuedAt:MMMM yyyy}.")
                                .FontSize(10)
                                .FontColor(Dark);

                            // SIGNATORIES AND QR CODE
                            column.Item()
                                .PaddingTop(9)
                                .Row(row =>
                                {
                                    // FIRST SIGNATORY
                                    row.RelativeItem()
                                        .PaddingHorizontal(8)
                                        .Column(signature =>
                                        {
                                            signature.Item()
                                                .Height(24);

                                            signature.Item()
                                                .AlignCenter()
                                                .Width(180)
                                                .LineHorizontal(1)
                                                .LineColor(Dark);

                                            signature.Item()
                                                .PaddingTop(3)
                                                .AlignCenter()
                                                .Text(firstSignatoryName)
                                                .FontSize(9)
                                                .Bold()
                                                .FontColor(Blue);

                                            signature.Item()
                                                .AlignCenter()
                                                .Text(firstSignatoryPosition)
                                                .FontSize(8)
                                                .FontColor(Gray);
                                        });

                                    // SECOND SIGNATORY
                                    row.RelativeItem()
                                        .PaddingHorizontal(8)
                                        .Column(signature =>
                                        {
                                            signature.Item()
                                                .Height(24);

                                            signature.Item()
                                                .AlignCenter()
                                                .Width(180)
                                                .LineHorizontal(1)
                                                .LineColor(Dark);

                                            signature.Item()
                                                .PaddingTop(3)
                                                .AlignCenter()
                                                .Text(secondSignatoryName)
                                                .FontSize(9)
                                                .Bold()
                                                .FontColor(Blue);

                                            signature.Item()
                                                .AlignCenter()
                                                .Text(secondSignatoryPosition)
                                                .FontSize(8)
                                                .FontColor(Gray);
                                        });

                                    // QR CODE
                                    row.ConstantItem(75)
                                        .AlignRight()
                                        .Column(qr =>
                                        {
                                            qr.Item()
                                                .AlignCenter()
                                                .Width(62)
                                                .Height(62)
                                                .Image(qrBytes);

                                            qr.Item()
                                                .PaddingTop(2)
                                                .AlignCenter()
                                                .Text("Scan to verify")
                                                .FontSize(7)
                                                .FontColor(Gray);
                                        });
                                });

                            // FOOTER
                            column.Item()
                                .PaddingTop(5)
                                .AlignCenter()
                                .Width(570)
                                .LineHorizontal(1)
                                .LineColor("#8AADE0");

                            column.Item()
                                .PaddingTop(3)
                                .AlignCenter()
                                .Text(
                                    $"CERTIFICATE NO.: {certificateNumber}   |   BATCH: {batchCode}")
                                .FontSize(8)
                                .FontColor(Gray);

                            column.Item()
                                .AlignCenter()
                                .Text(
                                    $"Verification Code: {verificationCode}")
                                .FontSize(7)
                                .FontColor(Gray);
                        });
                });
            });
        }).GeneratePdf(stream);

        stream.Position = 0;

        return stream;
    }

    private static string GetOrdinalSuffix(int day)
    {
        if (day % 100 is 11 or 12 or 13)
            return "th";

        return (day % 10) switch
        {
            1 => "st",
            2 => "nd",
            3 => "rd",
            _ => "th"
        };
    }
}
