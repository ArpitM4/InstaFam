import React from "react";
import Image from "next/image";
import { FaPen, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import FollowButton from "./FollowButton";
import BannerPickerModal from "./BannerPickerModal";

const PaymentProfileSection = ({
  username,
  currentUser,
  isOwner,
  isUploadingProfile,
  isUploadingCover,
  profileInputRef,
  coverInputRef,
  handleProfileChange,
  handleCoverChange,
  isEditing,
  setIsEditing,
  handleSaveDescription,
  eventDuration,
  setEventDuration,
  handleStartEvent,
  handleEndEvent,
  timeLeft,
  handleSavePerk,
  setcurrentUser,
  isEventActive,
  setShowBetaPopup,
  fanPoints = 0,
  canEarnBonus = false,
  onPointsUpdate,
  showBannerPicker,
  setShowBannerPicker,
  onSelectUnsplashBanner
}) => {
  // Generate fallback profile image URL only when needed
  const profileImageUrl = currentUser?.profilepic || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username || 'User')}&backgroundColor=6366f1`;
  const hasCoverImage = !!currentUser?.coverpic;

  return (
    <>
      {/* Banner - YouTube Style */}
      <div className="relative w-full">
        {/* Banner Image or Gradient Fallback */}
        <div
          className={`w-full h-24 sm:h-32 md:h-48 lg:h-56 relative overflow-hidden`}
          style={!hasCoverImage ? { background: 'var(--background)' } : {}}
        >
          {hasCoverImage && (
            <Image
              src={currentUser.coverpic}
              alt="Banner"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          )}

          {/* Owner: Change Banner Button */}
          {isOwner && (
            <>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={coverInputRef}
                onChange={handleCoverChange}
                disabled={isUploadingCover}
              />
              <button
                type="button"
                className={`absolute bottom-2 right-2 md:bottom-4 md:right-4 z-10 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full shadow hover:bg-black/80 transition text-xs md:text-sm font-medium flex items-center gap-1.5 ${isUploadingCover ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={() => !isUploadingCover && setShowBannerPicker(true)}
                disabled={isUploadingCover}
              >
                {isUploadingCover ? <FaSpinner className="animate-spin text-sm" /> : <FaPen className="text-xs" />}
                <span className="hidden sm:inline">Change Banner</span>
                <span className="sm:hidden">Edit</span>
              </button>
            </>
          )}

          {/* Loading Overlay for Banner Upload */}
          {isUploadingCover && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-[5]">
              <FaSpinner className="animate-spin text-white text-3xl mb-2" />
              <span className="text-white text-sm font-medium">Uploading banner...</span>
            </div>
          )}

          {/* Unsplash Attribution Credit (for legal compliance) */}
          {hasCoverImage && currentUser?.bannerAttribution?.photographer && (
            <a
              href={currentUser.bannerAttribution.unsplashUrl || currentUser.bannerAttribution.photographerUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-10 bg-black/40 backdrop-blur-sm text-white/70 hover:text-white px-2 py-1 rounded text-xs transition-colors"
            >
              Photo by {currentUser.bannerAttribution.photographer} on Unsplash
            </a>
          )}
        </div>

        {/* Profile image, centered and overlapping bottom edge */}
        <div className="absolute left-1/2 bottom-0 translate-x-[-50%] translate-y-1/2 flex justify-center items-center w-full pointer-events-none z-10">
          <div
            className={`w-32 h-32 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-background rounded-full shadow-lg border-4 border-white/20 overflow-hidden flex items-center justify-center relative ${isOwner ? 'group cursor-pointer pointer-events-auto' : ''}`}
            onClick={isOwner && !isUploadingProfile ? () => profileInputRef.current.click() : undefined}
            style={{ opacity: isUploadingProfile ? 0.6 : 1 }}
          >
            <Image
              src={profileImageUrl}
              alt="Profile"
              fill
              sizes="(max-width: 768px) 128px, 160px"
              className="object-cover rounded-full"
              style={{ filter: isUploadingProfile ? 'blur(2px)' : 'none' }}
              priority
              unoptimized
            />
            {isOwner && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={profileInputRef}
                  onChange={handleProfileChange}
                  disabled={isUploadingProfile}
                />
                {/* Uploading Overlay for Profile Image */}
                {isUploadingProfile ? (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-full z-10">
                    <FaSpinner className="animate-spin text-white text-2xl mb-1" />
                    <span className="text-white text-xs font-medium">Uploading...</span>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="bg-background/70 backdrop-blur-md rounded-full p-3 flex items-center justify-center">
                      <FaPen className="text-xl text-primary" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add margin below the banner to account for the overlapping profile image */}
      <div className="h-20" />

      {/* Profile Info Box */}
      <div className="relative mt-6 w-full max-w-md mx-auto p-5 rounded-2xl shadow-lg border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(10px)' }}>

        <h1 className="text-xl font-bold text-white text-center mb-0.5 flex items-center justify-center gap-2">
          {currentUser?.name || "User"}
          {currentUser?.isVerified && (
            <span className="text-blue-400" title="Verified Creator">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            </span>
          )}
        </h1>
        <p className="text-sm text-center text-text/60 mb-3">@{username}</p>

        {/* Follower Count for Creator's Own Page */}
        {isOwner && (
          <div className="flex justify-center mb-3">
            <span className="text-sm text-text/60 bg-background/50 px-3 py-1 rounded-lg">
              {(currentUser?.followersArray?.length || currentUser?.followers || 0).toLocaleString()} follower{(currentUser?.followersArray?.length || currentUser?.followers || 0) !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Follow Button */}
        <div className="flex justify-center mb-1">
          <FollowButton
            creatorId={currentUser?._id}
            creatorName={username}
            initialFollowerCount={currentUser?.followersArray?.length || currentUser?.followers || 0}
            showFollowerCount={false}
            onFollowChange={(isFollowing, newCount) => {
              setcurrentUser(prev => ({
                ...prev,
                followers: newCount,
                followersArray: prev.followersArray || []
              }));
              if (onPointsUpdate) onPointsUpdate();
            }}
          />
        </div>

        {/* Description */}
        {isOwner ? (
          <div className="relative">
            <textarea
              className="w-full mt-1 bg-background text-text text-sm text-center rounded-lg p-2 pb-6 resize-none focus:outline-none transition-all duration-200 border-0 placeholder-text/40"
              value={currentUser?.description || ""}
              onChange={(e) => setcurrentUser({ ...currentUser, description: e.target.value })}
              onBlur={handleSaveDescription}
              placeholder="Add a description..."
            />
            <FaPen className="absolute bottom-2 right-2 text-text/40 text-xs pointer-events-none" />
          </div>
        ) : (
          <p className="text-sm text-text/60 text-center mt-2">{currentUser?.description}</p>
        )}

        {/* FamPoints Display - Integrated */}
        {!isOwner && (
          <div className="mt-3 flex items-center justify-center gap-6 animate-in fade-in duration-500">
            {/* Points */}
            <div className="flex items-center gap-2">
              <span className="text-lg">🪙</span>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-none">
                  {fanPoints.toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-white/40 font-medium">FamPoints</span>
              </div>
            </div>

            {/* Bonus Incentive */}
            {canEarnBonus && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-[10px] font-medium text-green-400">+10 FP On Follow</span>
              </div>
            )}
          </div>
        )}



        {/* Event Timer */}
        {isEventActive && timeLeft && (
          <div className="mt-3 text-center bg-background/50 text-text/80 text-sm py-2 px-3 rounded-lg shadow-sm">
            <button
              onClick={() => setShowBetaPopup && setShowBetaPopup(true)}
              className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <FaExclamationTriangle className="text-red-500 text-xs" />
              <span className="font-medium text-green-500">Event is Live!</span>
            </button>
            <span className="ml-2">Ends in: <span className="font-medium">{timeLeft}</span></span>
          </div>
        )}
      </div>

      {/* Banner Picker Modal */}
      {showBannerPicker && (
        <BannerPickerModal
          onClose={() => setShowBannerPicker(false)}
          onUpload={(file) => {
            setShowBannerPicker(false);
            // Trigger the existing file input change handler
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            coverInputRef.current.files = dataTransfer.files;
            handleCoverChange({ target: { files: dataTransfer.files } });
          }}
          onSelectUnsplash={(imageUrl, attribution) => {
            setShowBannerPicker(false);
            onSelectUnsplashBanner(imageUrl, attribution);
          }}
          isUploading={isUploadingCover}
        />
      )}
    </>
  );
};

export default PaymentProfileSection;
