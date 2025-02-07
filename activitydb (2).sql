-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 07, 2025 at 08:50 AM
-- Server version: 8.0.17
-- PHP Version: 7.3.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `activitydb`
--

-- --------------------------------------------------------

--
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `system_id` int(11) NOT NULL,
  `important_info` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `details` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `file_paths` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `image_paths` text CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `dept_change_code` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `dept_full` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `system_id`, `important_info`, `details`, `file_paths`, `image_paths`, `dept_change_code`, `dept_full`, `created_at`) VALUES
(1, 17, '12', 'Pan', '/uploads/1736545661859-1jiaur.pdf', '', '', '', '2025-01-10 14:47:41'),
(2, 17, '12', 'ฟหกหฟ', '', '', '', '', '2025-01-10 14:59:30'),
(3, 17, '12', 'ไทย', '/uploads/1736546558845-3kfkv.pdf', '/uploads/1736546558846-c9beyp.png', '', '', '2025-01-10 15:02:38'),
(6, 13, '8', 'xxxห', '/uploads/1736548054061-uz4w13.docx', '', '', '', '2025-01-10 15:27:34'),
(7, 17, '11', 'เอเอ', '', '', '', '', '2025-01-10 16:58:45'),
(13, 13, '61', 'p', '', '', '', '', '2025-01-14 12:53:07'),
(14, 13, '61', 'ฟกหก', '', '', '', '', '2025-01-14 13:03:13'),
(15, 13, '61', '1', '', '', '', '', '2025-01-14 13:06:39'),
(16, 22, '60', 'ใ', '', '', '', '', '2025-01-14 13:09:52'),
(17, 17, '63', 'ย', '', '', '', '', '2025-01-14 13:12:49'),
(18, 13, '61', 'หก', '', '', '', '', '2025-01-14 13:15:41'),
(19, 13, '61', 'ดทค', '', '', '', '', '2025-01-14 13:19:02'),
(20, 13, '61', 'ส', '', '', '', '', '2025-01-14 13:20:37'),
(21, 17, '59', '==', '', '', '', '', '2025-01-14 18:56:40'),
(22, 13, '99', 'dqeqw', '', '', '', '', '2025-01-14 20:41:23'),
(23, 13, '99', 'dqeqw', '', '', '', '', '2025-01-14 20:41:32'),
(24, 13, '99', 'fsdf', '', '', '', '', '2025-01-14 20:42:36'),
(25, 22, '76', 'sad', '', '', '', '', '2025-01-14 20:43:55'),
(26, 17, '11', 'zcx', '', '', '', '', '2025-01-14 21:14:52'),
(27, 17, '11', 'sada', '', '', '', '', '2025-01-14 21:18:37'),
(31, 1, '1', 'กด', '', '/uploads/1738228783849-y9x6p9.jpg', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน', '2025-01-30 09:19:43');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `emp_id` int(11) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `dept_change_code` varchar(50) DEFAULT NULL,
  `dept_full` varchar(100) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'User'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`emp_id`, `first_name`, `last_name`, `dept_change_code`, `dept_full`, `role`) VALUES
(4983, 'ศักดิ์', 'ทวีสุข', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน', 'User'),
(498143, 'ปรวรรธน์', 'จรรยาเพศ', '530105002000300', 'แผนกพัฒนาระบบงานด้านทรัพยากรบุคคล', 'Superadmin'),
(498144, 'ศักดิ์', 'ทวีสุข', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน', 'Admin'),
(498145, 'ศราวุธ', 'สมบูรณ์ทรัพย์', '530105002000401', 'แผนกพัฒนาระบบงานการเงิน', 'User'),
(498146, 'วิลัยพร', 'บุญญะ', '530105002000303', 'แผนกพัฒนาระบบงานด้านทรัพยากรมนุษย์', 'Admin'),
(498147, 'อภิชัย', 'ธนู', '530105002000304', 'แผนกพัฒนาระบบงานด้านการวิเคราะห์ข้อมูล', 'User'),
(498148, 'ศราวุธ', 'สมบูรณ์ทรัพย์', '530105002000401', 'แผนกพัฒนาระบบงานการเงิน', 'User'),
(498156, 'ศักดิ์', 'ทวีสุข', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน', 'User'),
(498158, 'ราวุธ', 'สมบูรณ์ทรัพย์', '530105002000401', 'แผนกพัฒนาระบบงานการเงิน', 'User'),
(498146444, 'วิลัย', 'บุญญะ', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน', 'User'),
(498146455, 'วิลัยพร', 'บุญญะ', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน', 'User');

-- --------------------------------------------------------

--
-- Table structure for table `system_details`
--

CREATE TABLE `system_details` (
  `id` int(11) NOT NULL,
  `system_id` int(11) DEFAULT NULL,
  `important_info` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_no` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `additional_info` mediumtext COLLATE utf8mb4_unicode_ci,
  `dept_change_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `dept_full` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_details`
--

INSERT INTO `system_details` (`id`, `system_id`, `important_info`, `reference_no`, `file_path`, `created_at`, `additional_info`, `dept_change_code`, `dept_full`) VALUES
(1, 1, 'oo', '44', '/uploads/1738117030286-zn2g2t.docx', '2025-01-28 09:09:15', '', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน'),
(29, 13, 'rr', '474', '', '2025-01-28 08:48:45', '', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน'),
(30, 13, 'rr', '474', '', '2025-01-28 08:49:02', '', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน'),
(49, 1, 'กด', '45454', '', '2025-01-30 07:17:07', 'ไก่', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน'),
(50, 1, 'พด', '44455', '/uploads/1738221467276-fcmij.docx', '2025-01-30 07:17:47', 'พด', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน');

-- --------------------------------------------------------

--
-- Table structure for table `system_master`
--

CREATE TABLE `system_master` (
  `id` int(11) NOT NULL,
  `name_th` varchar(255) NOT NULL,
  `name_en` varchar(255) NOT NULL,
  `dept_change_code` varchar(255) NOT NULL DEFAULT '',
  `dept_full` varchar(255) NOT NULL DEFAULT '',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `system_master`
--

INSERT INTO `system_master` (`id`, `name_th`, `name_en`, `dept_change_code`, `dept_full`, `created_at`) VALUES
(1, 'ไก่ไทย', 'KFC', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน', '2025-01-28 09:09:04'),
(2, 'ระบบรับชำระเงิน', 'BPM', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน', '2025-01-02 09:34:28'),
(3, 'ไทย', 'English', '530105002000303', 'แผนกพัฒนาระบบงานด้านทรัพยากรมนุษย์', '2025-01-05 05:46:59'),
(4, 'เทส', 'test', '530105002000304', 'แผนกพัฒนาระบบงานด้านการวิเคราะห์ข้อมูล', '2025-01-08 05:02:08'),
(5, 'AABBCC', 'EE', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน', '2025-01-12 10:07:48'),
(6, 'ระบบการจัดการ', 'EST', '530105002000301', 'แผนกพัฒนาระบบงานด้านการเงิน', '2025-01-13 11:16:22');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`emp_id`);

--
-- Indexes for table `system_details`
--
ALTER TABLE `system_details`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_master`
--
ALTER TABLE `system_master`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `system_details`
--
ALTER TABLE `system_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `system_master`
--
ALTER TABLE `system_master`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
