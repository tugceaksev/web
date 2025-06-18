using System;
using System.Drawing;
using System.Windows.Forms;

namespace WindowsFormsApp
{
    public partial class Form1 : Form
    {
        private Button btnTest;
        private TextBox txtInput;
        private Label lblMessage;

        public Form1()
        {
            InitializeComponent();
            SetupControls();
        }

        private void SetupControls()
        {
            // Buton oluşturma
            btnTest = new Button
            {
                Text = "Tıkla",
                Location = new Point(350, 250),
                Size = new Size(100, 30)
            };
            btnTest.Click += BtnTest_Click;

            // TextBox oluşturma
            txtInput = new TextBox
            {
                Location = new Point(300, 200),
                Size = new Size(200, 20)
            };

            // Label oluşturma
            lblMessage = new Label
            {
                Text = "Merhaba! Lütfen bir şeyler yazın ve butona tıklayın.",
                Location = new Point(250, 150),
                Size = new Size(300, 20),
                TextAlign = ContentAlignment.MiddleCenter
            };

            // Kontrolleri forma ekleme
            this.Controls.Add(btnTest);
            this.Controls.Add(txtInput);
            this.Controls.Add(lblMessage);
        }

        private void BtnTest_Click(object sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(txtInput.Text))
            {
                MessageBox.Show("Lütfen bir şeyler yazın!", "Uyarı", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
            else
            {
                lblMessage.Text = $"Girdiğiniz metin: {txtInput.Text}";
            }
        }
    }
} 