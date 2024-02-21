import {
  getIsFollowing,
  deletePostAssociation,
  countPostAssociation,
  submitPost,
  createPostAssociation,
  sendDiamonds,
  getAppState,
  countPostAssociations,
  getPostAssociations,
  updateFollowingStatus,
  updateProfile,
  createUserAssociation,
  deleteUserAssociation,
  getUserAssociations,
  uploadImage,
} from 'deso-protocol';
import { useEffect, useState, useContext, useRef } from 'react';
import { DeSoIdentityContext } from 'react-deso-protocol';
import Link from 'next/link';
import {
  Container,
  Divider,
  List,
  FileButton,
  Text,
  UnstyledButton,
  Avatar,
  Group,
  Slider,
  rem,
  Paper,
  Menu,
  Center,
  Space,
  ActionIcon,
  Tooltip,
  Image,
  Box,
  Button,
  Textarea,
  Collapse,
  Modal,
  HoverCard,
  Title,
  TextInput,
} from '@mantine/core';
import {
  IconHeart,
  IconMessageShare,
  IconDiamond,
  IconRecycle,
  IconMessageCircle,
  IconDotsVertical,
  IconCheck,
  IconX,
  IconHeartFilled,
  IconDiamondFilled,
  IconHeartBroken,
  IconUserMinus,
  IconUserPlus,
} from '@tabler/icons-react';
import { TiInfoLargeOutline } from 'react-icons/ti';
import { Player } from '@livepeer/react';
import { useDisclosure, useHover } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { BsChatQuoteFill, BsInfoCircleFill } from 'react-icons/bs';
import { FaVoteYea, FaPoll } from 'react-icons/fa';
import { RiUserUnfollowLine, RiUserAddLine, RiNftLine, RiImageAddFill } from 'react-icons/ri';
import { TbPinned, TbPinnedOff } from 'react-icons/tb';
import { GoBookmark, GoBookmarkFill } from 'react-icons/go';
import { PiUserCirclePlus, PiUserCircleMinus } from 'react-icons/pi';
import { FiEdit } from 'react-icons/fi';
import { MdDeleteForever } from 'react-icons/md';
import { CgPlayListAdd } from 'react-icons/cg';
import { ImEmbed } from 'react-icons/im';
import { replaceURLs } from '../helpers/linkHelper';
import formatDate from '@/formatDate';
import { SubscriptionModal } from './SubscriptionModal';
import { NftModal } from './NftModal';
import { getEmbedHeight, getEmbedURL, getEmbedWidth, isValidEmbedURL } from '../helpers/EmbedUrls';

export default function Post({ post, username }) {
  const { hovered, ref } = useHover();
  const { currentUser } = useContext(DeSoIdentityContext);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [tip, setTip] = useState(1);
  const [openedImage, { open: openImage, close: closeImage }] = useDisclosure(false);
  const [openedQuote, { open: openQuote, close: closeQuote }] = useDisclosure(false);
  const [openedEdit, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [openedNft, { open: openNft, close: closeNft }] = useDisclosure(false);
  const [openedHide, { open: openHide, close: closeHide }] = useDisclosure(false);
  const [openedDiamonds, { open: openDiamond, close: closeDiamond }] = useDisclosure(false);
  const [diamondLevelsUsd, setDiamondLevelsUsd] = useState([]);
  const [opened, { toggle }] = useDisclosure(false);
  const [quoteBody, setQuoteBody] = useState('');
  const [editedPost, setEditedPost] = useState();
  const [voteCount, setVoteCount] = useState();
  const [didVote, setDidVote] = useState(false);
  const [isHearted, setIsHearted] = useState();
  const [heartCount, setHeartCount] = useState(post.LikeCount);
  const [didHeartId, setDidHeartId] = useState();
  const [didBookmarkId, setDidBookmarkId] = useState();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCloseFriend, setIsCloseFriend] = useState(false);
  const [didCloseFriendId, setCloseFriendId] = useState();
  const [repostCount, setRepostCount] = useState(post.RepostCount);
  const [diamondCount, setDiamondCount] = useState(post.DiamondCount);
  const [commentCount, setCommentCount] = useState(post.CommentCount);
  const [isFollowingUser, setisFollowingUser] = useState(false);
  const [didPinPost, setDidPinPost] = useState();
  const [editBody, setEditBody] = useState(post?.Body || '');
  const [imageLoading, setImageLoading] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const resetImageRef = useRef(null);
  const [poll, setPoll] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [embed, setEmbed] = useState(false);
  const [uploadInitiated, setUploadInitiated] = useState(false);

  const handlePollOptions = (index, value) => {
    // Create a new array with the same values, but with the updated value at the specified index
    const newOptions = [...pollOptions];
    newOptions[index] = value;

    setPollOptions(newOptions);
  };

  const addPollOption = () => {
    setPollOptions([...pollOptions, '']); // Add a new empty option
  };

  const deletePollOption = (index) => {
    const newOptions = pollOptions.filter((_, idx) => idx !== index);
    setPollOptions(newOptions);
  };

  const pollToggle = () => {
    if (poll) {
      setPoll(false);
    } else {
      setPoll(true);
    }
  };

  const embedToggle = () => {
    if (embed) {
      setEmbed(false);
    } else {
      setEmbed(true);
    }
  };

  const handleEmbedLink = (e) => {
    const link = e.target.value;

    if (link.trim().length > 0) {
      const response = getEmbedURL(link);
      const isValid = isValidEmbedURL(response);
      if (isValid) {
        setEmbedUrl(response);
      } else {
        setEmbedUrl(null);
      }
    }
  };

  const handleUploadImage = async () => {
    if (uploadInitiated) {
      return; // Exit if upload has already been initiated
    }
    setUploadInitiated(true);

    try {
      setImageLoading(true);
      const response = await uploadImage({
        UserPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        file: imageFile,
      });

      setImageURL(response.ImageURL);
      setImageLoading(false);
      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'Uploaded!',
      });
    } catch (error) {
      setImageLoading(false);
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });
      console.log(`Something happened: ${error}`);
    } finally {
      setUploadInitiated(false);
    }
  };

  useEffect(() => {
    if (imageFile) {
      handleUploadImage(); // Automatically trigger upload when imageFile is set
    }
  }, [imageFile]); // This effect runs whenever imageFile changes

  const isWavesStream =
    post.VideoURLs && post.VideoURLs[0] && post.VideoURLs[0].includes('https://lvpr.tv/?v=');

  const extractPlaybackId = (url) => {
    const match = url.match(/https:\/\/lvpr\.tv\/\?v=(.*)/);
    const playbackId = match ? match[1] : null;
    return playbackId;
  };

  // Get if Current User follows profile
  const getIsFollowingData = async () => {
    try {
      const req = {
        PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        IsFollowingPublicKeyBase58Check: post.PosterPublicKeyBase58Check,
      };

      const result = await getIsFollowing(req);
      setisFollowingUser(result.IsFollowing);
    } catch (error) {
      console.error('Error checking if following:', error);
    }
  };
  useEffect(() => {
    if (currentUser) {
      getIsFollowingData();
    }
  }, [currentUser]);

  // Follow profile
  const followUser = async () => {
    try {
      await updateFollowingStatus({
        MinFeeRateNanosPerKB: 1000,
        IsUnfollow: false,
        FollowedPublicKeyBase58Check: post?.PosterPublicKeyBase58Check,
        FollowerPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
      });
      getIsFollowingData();
      notifications.show({
        title: 'Success',
        icon: <RiUserAddLine size="1.1rem" />,
        color: 'blue',
        message: `You successfully followed ${username}`,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });
    }
  };

  // Unfollow profile
  const unfollowUser = async () => {
    try {
      await updateFollowingStatus({
        MinFeeRateNanosPerKB: 1000,
        IsUnfollow: true,
        FollowedPublicKeyBase58Check: post.PosterPublicKeyBase58Check,
        FollowerPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
      });
      getIsFollowingData();
      notifications.show({
        title: 'Success',
        icon: <RiUserUnfollowLine size="1.1rem" />,
        color: 'blue',
        message: `You successfully unfollowed ${username}`,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });
    }
  };

  // Getting Diamond Values in USD
  const getDiamondUSD = async () => {
    try {
      const appState = await getAppState({
        PublicKeyBase58Check: 'BC1YLjYHZfYDqaFxLnfbnfVY48wToduQVHJopCx4Byfk4ovvwT6TboD',
      });
      const desoUSD = appState.USDCentsPerDeSoCoinbase / 100;
      const nanoToDeso = 0.000000001;
      const diamondLevelMapUsd = Object.values(appState.DiamondLevelMap).map((nanos) => {
        const deso = nanos * nanoToDeso;
        let usdValue = deso * desoUSD;

        if (usdValue < 0.01) {
          usdValue = 0.01;
        }

        return usdValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      });

      setDiamondLevelsUsd(diamondLevelMapUsd);
    } catch (error) {
      console.error('Error in getData:', error);
    }
  };

  // Comment Function
  const submitComment = async () => {
    if (!currentUser) {
      notifications.show({
        title: 'Sign In',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Sign In to like this post!',
      });
      return;
    }

    try {
      setIsLoadingPost(true);
      // Filter out empty or whitespace-only options
      const validPollOptions = pollOptions.filter((option) => option.trim() !== '');

      await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ParentStakeID: post.PostHashHex,
        BodyObj: {
          Body: comment,
          VideoURLs: [],
          ImageURLs: imageURL ? [imageURL] : [],
        },
        PostExtraData: {
          EmbedVideoURL: embedUrl || '',
          PollOptions: validPollOptions.length >= 2 ? JSON.stringify(validPollOptions) : null,
          PollWeightType: validPollOptions.length >= 2 ? 'unweighted' : null,
        },
      });

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'Your comment was submitted!',
      });
      setIsLoadingPost(false);
      setCommentCount(post.CommentCount + 1);
      setComment('');
      if (imageURL) {
        setImageURL('');
        setImageFile(null);
        resetImageRef.current?.();
      }
      if (pollOptions && pollOptions.length > 1) {
        setPollOptions(['', '']);
        setPoll(false);
      }
      if (embedUrl) {
        setEmbedUrl('');
        setEmbed(false);
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });
      console.error('Error submitting comment:', error);
    }

    // Reset the comment state after submitting
    setComment('');
  };

  // Repost Function
  const submitRepost = async () => {
    if (!currentUser) {
      notifications.show({
        title: 'Sign In',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Sign In to like this post!',
      });
      return;
    }

    try {
      await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        RepostedPostHashHex: post.PostHashHex,
        BodyObj: {
          Body: '',
          VideoURLs: [],
          ImageURLs: [],
        },
      });
      notifications.show({
        title: 'Success',
        icon: <IconRecycle size="1.1rem" />,
        color: 'green',
        message: 'Reposted!',
      });
      setRepostCount(post.RepostCount + 1);
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });
      console.error('Error submitting Repost:', error);
    }
  };

  //Quote Post Function
  const submitQuote = async () => {
    if (!currentUser) {
      notifications.show({
        title: 'Sign In',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Sign In to like this post!',
      });
      return;
    }

    try {
      setIsLoadingPost(true);
      // Filter out empty or whitespace-only options
      const validPollOptions = pollOptions.filter((option) => option.trim() !== '');

      await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        RepostedPostHashHex: post.PostHashHex,
        BodyObj: {
          Body: quoteBody,
          VideoURLs: [],
          ImageURLs: imageURL ? [imageURL] : [],
        },
        PostExtraData: {
          EmbedVideoURL: embedUrl || '',
          PollOptions: validPollOptions.length >= 2 ? JSON.stringify(validPollOptions) : null,
          PollWeightType: validPollOptions.length >= 2 ? 'unweighted' : null,
        },
      });
      notifications.show({
        title: 'Success',
        icon: <IconRecycle size="1.1rem" />,
        color: 'green',
        message: 'Quoted!',
      });
      setIsLoadingPost(false);
      setRepostCount(post.RepostCount + 1);

      setQuoteBody('');
      if (imageURL) {
        setImageURL('');
        setImageFile(null);
        resetImageRef.current?.();
      }
      if (pollOptions && pollOptions.length > 1) {
        setPollOptions(['', '']);
        setPoll(false);
      }
      if (embedUrl) {
        setEmbedUrl('');
        setEmbed(false);
      }
      closeQuote();
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });
      console.error('Error submitting Quote:', error);
    }
  };

  // Edit Post Function
  const editPost = async () => {
    try {
      const response = await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        PostHashHexToModify: post.PostHashHex,
        BodyObj: {
          Body: editBody,
          VideoURLs: [],
          ImageURLs: [],
        },
      });

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'Edit Submitted!',
      });

      if (response?.submittedTransactionResponse?.PostEntryResponse) {
        setEditedPost(response?.submittedTransactionResponse?.PostEntryResponse);
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });

      console.error('Error submitting Quote:', error);
    }
  };

  // Hide Post Function
  const hidePost = async () => {
    try {
      await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        PostHashHexToModify: post.PostHashHex,
        BodyObj: {
          Body: editBody,
          VideoURLs: [],
          ImageURLs: [],
        },
        IsHidden: true,
      });
      closeHide();
      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'green',
        message: 'Post Hidden!',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });

      console.error('Error submitting Quote:', error);
    }
  };

  // Getting "LOVE" Post Association Count
  const getHeartCount = async () => {
    try {
      const heartStats = await countPostAssociation({
        PostHashHex: post.PostHashHex,
        AssociationType: 'REACTION',
        AssociationValue: 'LOVE',
      });

      setHeartCount((prevHeartCount) => prevHeartCount + heartStats.Count);
    } catch (error) {
      console.error(error);
    }
  };

  // Getting if user Loved post & getting association Id so user has option to delete the association
  const getDidUserHeart = async () => {
    try {
      const didHeart = await getPostAssociations({
        PostHashHex: post.PostHashHex,
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        AssociationType: 'REACTION',
        AssociationValue: 'LOVE',
      });

      setDidHeartId(didHeart.Associations[0]?.AssociationID);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      getDidUserHeart();
    }
  }, [currentUser, isHearted]);

  useEffect(() => {
    getHeartCount();
  }, []);

  //Love Post Function
  const submitHeart = async () => {
    if (!currentUser) {
      notifications.show({
        title: 'Sign In',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Sign In to like this post!',
      });
      return;
    }

    try {
      await createPostAssociation({
        TransactorPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        PostHashHex: post.PostHashHex,
        AssociationType: 'REACTION',
        AssociationValue: 'LOVE',
        MinFeeRateNanosPerKB: 1000,
      });

      setIsHearted(true);
      setHeartCount(heartCount + 1);
      notifications.show({
        title: 'Success',
        icon: <IconHeartFilled size="1.1rem" />,
        color: 'blue',
        message: `You hearted ${username}'s post! Keep it going!`,
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });
      setIsHearted(false);

      console.error('Error submitting heart:', error);
    }
  };

  // Delete Love Post Function
  const deleteHeart = async () => {
    try {
      await deletePostAssociation({
        TransactorPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        PostHashHex: post.PostHashHex,
        AssociationID: didHeartId,
        AssociationType: 'REACTION',
        AssociationValue: 'LOVE',
        MinFeeRateNanosPerKB: 1000,
      });

      setDidHeartId(null);
      setIsHearted(false);
      setHeartCount(heartCount - 1);
      notifications.show({
        title: 'Removed',
        icon: <IconHeartBroken size="1.1rem" />,
        color: 'blue',
        message: 'You removed your Heart Reaction!',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });
      setIsHearted(true);

      console.error('Error submitting heart:', error);
    }
  };

  // Diamond Tip Post
  const sendDiamondTip = async () => {
    if (!currentUser) {
      notifications.show({
        title: 'Sign In',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `You need to sign in to tip ${username}`,
      });

      return;
    }

    try {
      await sendDiamonds({
        ReceiverPublicKeyBase58Check: post.PosterPublicKeyBase58Check,
        SenderPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        DiamondPostHashHex: post.PostHashHex,
        DiamondLevel: tip,
        MinFeeRateNanosPerKB: 1000,
      });
      notifications.show({
        title: 'Success',
        icon: <IconDiamondFilled size="1.1rem" />,
        color: 'blue',
        message: `You sent ${tip} Diamonds to ${username}`,
      });

      closeDiamond();
      setDiamondCount(post.DiamondCount + 1);
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'You already tipped this post!',
      });
      console.error('Error submitting diamond:', error);
    }
  };

  //Cast a Vote
  const submitVote = async (option) => {
    if (!currentUser) {
      notifications.show({
        title: 'Sign In',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Sign In to Vote',
      });
      return;
    }

    try {
      await createPostAssociation({
        TransactorPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        PostHashHex: post.PostHashHex,
        AssociationType: 'POLL_RESPONSE',
        AssociationValue: option,
        MinFeeRateNanosPerKB: 1000,
      });

      setDidVote(true);
      notifications.show({
        title: 'Success',
        icon: <FaVoteYea size="1.1rem" />,
        color: 'blue',
        message: 'You Voted!',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: 'Something Happened!',
      });
      console.error('Error submitting vote:', error);
    }
  };

  //Get Poll Options
  const parsePollOptionsString = (optionsString) => {
    try {
      const optionsArray = JSON.parse(optionsString);

      return optionsArray;
    } catch (error) {
      console.error('Error parsing options string:', error);
      return [];
    }
  };

  let pollPostOptions = [];
  if (post.PostExtraData && typeof post.PostExtraData.PollOptions === 'string') {
    pollPostOptions = parsePollOptionsString(post.PostExtraData.PollOptions);
  }

  // Get Votes for Poll
  const getVotes = async () => {
    try {
      // Call countPostAssociations with all poll options
      const votes = await countPostAssociations({
        PostHashHex: post.PostHashHex,
        AssociationType: 'POLL_RESPONSE',
        AssociationValues: pollPostOptions,
      });
      console.log(votes);
      setVoteCount(votes);
    } catch (error) {
      console.error('Error fetching poll votes:', error);
    }
  };

  const calculatePercentage = (option) => {
    if (voteCount && voteCount.Total > 0) {
      const optionVoteCount = voteCount.Counts[option] || 0;
      return Math.round((optionVoteCount / voteCount.Total) * 100); // Rounds to the nearest whole number
    }
    return 0; // Return 0 instead of "0.00" for consistency with integer values
  };

  useEffect(() => {
    if (didVote) {
      getVotes();
    }
  }, [didVote]);

  // Pin Post
  const handlePinPost = async (postHash) => {
    try {
      const updateData = {
        UpdaterPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        ProfilePublicKeyBase58Check: '',
        NewUsername: '',
        MinFeeRateNanosPerKB: 1000,
        NewCreatorBasisPoints: 100,
        NewDescription: '',
        NewStakeMultipleBasisPoints: 12500,
        ExtraData: {
          PinnedPostHashHex: postHash,
        },
      };

      await updateProfile(updateData);

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'blue',
        message: 'Post has been pinned to your profile!',
      });
      setDidPinPost(true);
    } catch (error) {
      notifications.show({
        title: 'Error Pinning post',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: error,
      });
      setDidPinPost(false);
    }
  };

  // Pin Post
  const handleUnpinPost = async () => {
    try {
      const updateData = {
        UpdaterPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        ProfilePublicKeyBase58Check: '',
        NewUsername: '',
        MinFeeRateNanosPerKB: 1000,
        NewCreatorBasisPoints: 100,
        NewDescription: '',
        NewStakeMultipleBasisPoints: 12500,
        ExtraData: {
          PinnedPostHashHex: '',
        },
      };

      await updateProfile(updateData);

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'blue',
        message: 'Pinned Post Removed!',
      });
      setDidPinPost(false);
    } catch (error) {
      notifications.show({
        title: 'Error Pinning post',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: error,
      });
      setDidPinPost(true);
    }
  };

  // Getting if bookmarked post & getting association Id so user has option to delete the association
  const getDidUserBookmark = async () => {
    try {
      const didBookmark = await getPostAssociations({
        PostHashHex: post.PostHashHex,
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        AssociationType: 'BOOKMARK',
        AssociationValue: 'BOOKMARK',
      });

      setDidBookmarkId(didBookmark.Associations[0]?.AssociationID);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      getDidUserBookmark();
    }
  }, [currentUser, isBookmarked]);

  // Bookmark Post
  const handleBookmark = async () => {
    try {
      await createPostAssociation({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        PostHashHex: post.PostHashHex,
        AssociationType: 'BOOKMARK',
        AssociationValue: 'BOOKMARK',
        MinFeeRateNanosPerKB: 1000,
      });

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'blue',
        message: 'Post Bookmarked!',
      });
      setIsBookmarked(true);
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });
      setIsBookmarked(false);

      console.error('Error submitting heart:', error);
    }
  };

  // Remove Bookmark Post
  const handleRemoveBookmark = async () => {
    try {
      await deletePostAssociation({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        PostHashHex: post.PostHashHex,
        AssociationID: didBookmarkId,
        AssociationType: 'BOOKMARK',
        AssociationValue: 'BOOKMARK',
        MinFeeRateNanosPerKB: 1000,
      });

      notifications.show({
        title: 'Success',
        icon: <IconCheck size="1.1rem" />,
        color: 'blue',
        message: 'Bookmark Removed!',
      });

      setIsBookmarked(false);
      setDidBookmarkId(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });

      setIsBookmarked(true);
      console.error('Error submitting heart:', error);
    }
  };

  // Getting if is close friend & getting association Id so user has option to delete the association
  const getDidCloseFriend = async () => {
    try {
      const didCF = await getUserAssociations({
        TargetUserPublicKeyBase58Check: post.PosterPublicKeyBase58Check,
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        AssociationType: 'CLOSE-FRIEND',
        AssociationValue: 'CLOSE-FRIEND',
      });

      setCloseFriendId(didCF.Associations[0]?.AssociationID);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      getDidCloseFriend();
    }
  }, [currentUser, isCloseFriend]);

  // Add Close Friend
  const handleAddCloseFriend = async () => {
    try {
      await createUserAssociation({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        TargetUserPublicKeyBase58Check: post.PosterPublicKeyBase58Check,
        AssociationType: 'CLOSE-FRIEND',
        AssociationValue: 'CLOSE-FRIEND',
        MinFeeRateNanosPerKB: 1000,
      });

      notifications.show({
        title: 'Success',
        icon: <IconUserPlus size="1.1rem" />,
        color: 'blue',
        message: `${username} added to Close Friends!`,
      });
      setIsCloseFriend(true);
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });
      setIsCloseFriend(false);

      console.error('Error submitting heart:', error);
    }
  };

  // Remove Close Friend
  const handleRemoveCloseFriend = async () => {
    try {
      await deleteUserAssociation({
        TransactorPublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        TargetUserPublicKeyBase58Check: post.PosterPublicKeyBase58Check,
        AssociationID: didCloseFriendId,
        AssociationType: 'CLOSE-FRIEND',
        AssociationValue: 'CLOSE-FRIEND',
        MinFeeRateNanosPerKB: 1000,
      });

      notifications.show({
        title: 'Success',
        icon: <IconUserMinus size="1.1rem" />,
        color: 'blue',
        message: 'Close Friend Removed!',
      });

      setIsCloseFriend(false);
      setCloseFriendId(null);
    } catch (error) {
      notifications.show({
        title: 'Error',
        icon: <IconX size="1.1rem" />,
        color: 'red',
        message: `Something Happened: ${error}`,
      });

      setIsCloseFriend(true);
      console.error('Error submitting heart:', error);
    }
  };

  return (
    <>
      <Modal opened={openedImage} onClose={closeImage} zIndex={9999999999999} fullScreen>
        <Image src={selectedImage} radius="md" alt="post-image" fit="contain" />
      </Modal>

      <Modal
        opened={openedNft}
        onClose={closeNft}
        centered
        size="xl"
        title={<Title order={2}>Mint As NFT</Title>}
        zIndex={9999999999999}
      >
        <NftModal postHash={post?.PostHashHex} />
      </Modal>

      <Modal
        zIndex={9999999999999}
        radius="xl"
        opened={openedHide}
        onClose={closeHide}
        centered
        size="sm"
        withCloseButton={false}
      >
        <>
          <Text ta="center" fw={777} size="xl">
            Hide Post?
          </Text>
          <Space h="lg" />
          <Text c="dimmed" ta="center" size="sm">
            Are you sure you want to hide this post? This cant be undone.
          </Text>
          <Space h="lg" />
          <Group justify="center">
            <Button color="red" onClick={hidePost}>
              Hide
            </Button>
            <Button variant="default" onClick={closeHide}>
              Cancel
            </Button>
          </Group>
        </>
      </Modal>

      <Modal
        opened={openedEdit}
        onClose={closeEdit}
        centered
        size="xl"
        title="Edit Post"
        zIndex={9999999999999}
      >
        <>
          <Textarea
            value={editBody}
            onChange={(event) => setEditBody(event.currentTarget.value)}
            placeholder={editBody}
            variant="filled"
            size="lg"
            style={{ flexGrow: 1, width: 'auto' }}
          />
          <Space h="md" />
          <Group justify="right">
            <Button disabled={editBody === post.Body} onClick={editPost}>
              Edit
            </Button>
          </Group>
          <Space h="md" />

          {editedPost ? (
            <Post post={editedPost} username={username} />
          ) : (
            <Post post={post} username={username} />
          )}
        </>
      </Modal>

      <Modal
        radius="xl"
        opened={openedDiamonds}
        onClose={closeDiamond}
        size="md"
        centered
        zIndex={9999999999999}
      >
        <Text ta="center">{`Diamond Tip ${username}'s Post`}</Text>

        <Group p="xl" grow h={111}>
          <Slider
            defaultValue={1}
            min={1}
            max={6}
            marks={[
              { value: 1, label: diamondLevelsUsd[0] },
              { value: 2, label: diamondLevelsUsd[1] },
              { value: 3, label: diamondLevelsUsd[2] },
              { value: 4, label: diamondLevelsUsd[3] },
              { value: 5, label: diamondLevelsUsd[4] },
              { value: 6, label: diamondLevelsUsd[5] },
            ]}
            value={tip}
            onChange={setTip}
            step={1}
            label={tip}
            thumbChildren={<IconDiamondFilled size="1rem" />}
            thumbSize={26}
          />
        </Group>
        <Group justify="right" mr={22}>
          <Button
            onClick={() => {
              sendDiamondTip(post.PostHashHex, post.PosterPublicKeyBase58Check);
            }}
            leftSection={<IconDiamond size="1rem" />}
          >
            Tip
          </Button>
        </Group>
      </Modal>

      <Modal opened={openedQuote} onClose={closeQuote} size="xl" centered zIndex={9999999999999}>
        <Group style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <div style={{ marginRight: '10px' }}>
            <Avatar
              variant="light"
              radius="xl"
              size="lg"
              src={
                `https://node.deso.org/api/v0/get-single-profile-picture/${currentUser?.PublicKeyBase58Check}` ||
                null
              }
              alt="Profile Picture"
              mb={20}
            />
          </div>

          <Textarea
            variant="unstyled"
            placeholder="Say some dope shit"
            size="lg"
            value={quoteBody}
            onChange={(event) => setQuoteBody(event.currentTarget.value)}
            style={{ flexGrow: 1, width: 'auto' }}
          />
        </Group>
        <Space h="xs" />
        {imageURL && (
          <div>
            <ActionIcon
              type="button"
              onClick={() => {
                setImageURL('');
                setImageFile(null);
                resetImageRef.current?.();
              }}
              size="xs"
              color="red"
            >
              <IconX />
            </ActionIcon>
            <Image src={imageURL} alt="Uploaded" maw={240} mx="auto" radius="md" />
          </div>
        )}

        {embedUrl && (
          <>
            <div>
              <ActionIcon type="button" onClick={() => setEmbedUrl('')} size="xs" color="red">
                <IconX />
              </ActionIcon>
            </div>

            <iframe
              title="extraembed-video"
              id="embed-iframe"
              className="w-full flex-shrink-0 feed-post__image"
              height={getEmbedHeight(embedUrl)}
              style={{ maxWidth: getEmbedWidth(embedUrl) }}
              src={embedUrl}
              frameBorder="0"
              allow="picture-in-picture; clipboard-write; encrypted-media; gyroscope; accelerometer; encrypted-media;"
              allowFullScreen
            />

            <Space h="xs" />
          </>
        )}

        {poll && (
          <>
            <Space h="xs" />

            <Container size="sm">
              <Group justify="right">
                <Tooltip label="Add Options">
                  <ActionIcon type="button" onClick={addPollOption} size="sm">
                    <CgPlayListAdd size="1.1rem" />
                  </ActionIcon>
                </Tooltip>
              </Group>

              <Space h="md" />

              {pollOptions &&
                pollOptions?.map((option, index) => (
                  <div key={index}>
                    <TextInput
                      variant="filled"
                      placeholder={`Option ${index + 1}`}
                      radius="xl"
                      value={option}
                      onChange={(event) => handlePollOptions(index, event.currentTarget.value)}
                      rightSection={
                        index > 1 && (
                          <ActionIcon
                            radius="xl"
                            size="sm"
                            color="red"
                            variant="light"
                            type="button"
                            onClick={() => deletePollOption(index)}
                          >
                            <MdDeleteForever />
                          </ActionIcon>
                        )
                      }
                    />

                    <Space h="sm" />
                  </div>
                ))}
            </Container>
            <Space h="xs" />
          </>
        )}

        {embed && (
          <>
            <Space h="xs" />
            <Box w={222}>
              <TextInput
                leftSection={
                  <>
                    <Tooltip
                      label={
                        <>
                          <Group justify="center">Supported</Group>

                          <Divider />

                          <List size="xs">
                            <List.Item>Twitch</List.Item>
                            <List.Item>Youtube</List.Item>
                            <List.Item>Spotify</List.Item>
                            <List.Item>Vimeo</List.Item>
                            <List.Item>Giphy</List.Item>
                            <List.Item>SoundCloud</List.Item>
                            <List.Item>Mousai</List.Item>
                            <List.Item>Request more in Global Chat!</List.Item>
                          </List>
                        </>
                      }
                      position="bottom"
                      withArrow
                    >
                      <ActionIcon type="button" size="xs" radius="xl" variant="default">
                        <TiInfoLargeOutline />
                      </ActionIcon>
                    </Tooltip>
                  </>
                }
                rightSection={
                  embedUrl && (
                    <ActionIcon
                      type="button"
                      onClick={() => setEmbedUrl('')}
                      color="red"
                      size="xs"
                      radius="xl"
                      variant="subtle"
                    >
                      <IconX />
                    </ActionIcon>
                  )
                }
                value={embedUrl}
                onChange={handleEmbedLink}
                variant="filled"
                size="xs"
                radius="xl"
                placeholder="Add Link"
              />
            </Box>
            <Space h="xs" />
          </>
        )}

        <Group justify="right">
          <Group justify="apart">
            <FileButton
              onChange={setImageFile}
              accept="image/png,image/jpeg,image/png,image.gif,image/webp"
              resetRef={resetImageRef}
              type="button"
            >
              {(props) => (
                <Tooltip label="Upload Image">
                  <ActionIcon
                    color="blue"
                    size="lg"
                    variant="default"
                    {...props}
                    loading={uploadInitiated}
                  >
                    <RiImageAddFill size="1.2rem" />
                  </ActionIcon>
                </Tooltip>
              )}
            </FileButton>

            <Tooltip label="Add Poll">
              <ActionIcon
                color="blue"
                size="lg"
                variant="default"
                onClick={pollToggle}
                type="button"
              >
                <FaPoll size="1.2rem" />
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Embed">
              <ActionIcon
                color="blue"
                size="lg"
                variant="default"
                onClick={embedToggle}
                type="button"
              >
                <ImEmbed size="1.2rem" />
              </ActionIcon>
            </Tooltip>

            <Button
              onClick={() => {
                if (currentUser) {
                  submitQuote();
                } else {
                  notifications.show({
                    title: 'Must be Signed In',
                    icon: <IconX size="1.1rem" />,
                    color: 'Red',
                    message: 'Please sign in to post.',
                  });
                }
              }}
              loading={isLoadingPost}
              disabled={
                !quoteBody.trim() ||
                isLoadingPost ||
                (poll && pollOptions.filter((option) => option.trim() !== '').length < 2)
              }
            >
              Quote
            </Button>
          </Group>
        </Group>
        <Post post={post} username={username} />
      </Modal>

      {post.IsHidden ? (
        <></>
      ) : (
        <Paper m="md" shadow="lg" radius="md" p={3} withBorder>
          <Space h="xs" />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Group ml={7} gap={5} justify="left">
              {currentUser &&
                (isBookmarked || didBookmarkId ? (
                  <Tooltip label="Remove Bookmark">
                    <ActionIcon size="md" variant="subtle" onClick={() => handleRemoveBookmark()}>
                      <GoBookmarkFill style={{ width: rem(20), height: rem(20) }} />
                    </ActionIcon>
                  </Tooltip>
                ) : (
                  <Tooltip label="Bookmark">
                    <ActionIcon size="md" variant="subtle" onClick={() => handleBookmark()}>
                      <GoBookmark style={{ width: rem(20), height: rem(20) }} />
                    </ActionIcon>
                  </Tooltip>
                ))}

              <Text c="dimmed" size="xs" fw={500}>
                {formatDate(post?.TimestampNanos)} ago
              </Text>
            </Group>

            <Group mr={7} justify="right">
              <Menu shadow="md" width={177}>
                <Menu.Target>
                  <ActionIcon color="blue" size="md" variant="transparent">
                    <IconDotsVertical />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconMessageShare style={{ width: rem(16), height: rem(16) }} />}
                    component={Link}
                    href={`/posts/${post.PostHashHex}`}
                  >
                    {post.IsNFT ? 'View NFT' : 'View Post'}
                  </Menu.Item>

                  {!post.IsNFT &&
                    currentUser &&
                    currentUser?.PublicKeyBase58Check === post.PosterPublicKeyBase58Check && (
                      <Menu.Item
                        onClick={openNft}
                        leftSection={<RiNftLine style={{ width: rem(16), height: rem(16) }} />}
                      >
                        Mint NFT
                      </Menu.Item>
                    )}
                  {currentUser &&
                    currentUser?.PublicKeyBase58Check === post.PosterPublicKeyBase58Check && (
                      <Menu.Item
                        onClick={openEdit}
                        leftSection={<FiEdit style={{ width: rem(16), height: rem(16) }} />}
                      >
                        Edit
                      </Menu.Item>
                    )}

                  {currentUser &&
                    currentUser?.PublicKeyBase58Check !== post.PosterPublicKeyBase58Check &&
                    (isCloseFriend || didCloseFriendId ? (
                      <Menu.Item
                        onClick={() => handleRemoveCloseFriend()}
                        leftSection={
                          <PiUserCircleMinus style={{ width: rem(16), height: rem(16) }} />
                        }
                      >
                        Remove
                      </Menu.Item>
                    ) : (
                      <Menu.Item
                        onClick={() => handleAddCloseFriend()}
                        leftSection={
                          <PiUserCirclePlus style={{ width: rem(16), height: rem(16) }} />
                        }
                      >
                        Add Close Friend
                      </Menu.Item>
                    ))}

                  {currentUser &&
                    currentUser?.PublicKeyBase58Check === post.PosterPublicKeyBase58Check &&
                    (didPinPost ||
                    currentUser?.ProfileEntryResponse?.ExtraData?.PinnedPostHashHex ===
                      post.PostHashHex ? (
                      <Menu.Item
                        onClick={() => handleUnpinPost()}
                        leftSection={<TbPinnedOff style={{ width: rem(16), height: rem(16) }} />}
                      >
                        {post.IsNFT ? 'Pin NFT' : 'Pin Post'}
                      </Menu.Item>
                    ) : (
                      <Menu.Item
                        onClick={() => handlePinPost(post.PostHashHex)}
                        leftSection={<TbPinned style={{ width: rem(16), height: rem(16) }} />}
                      >
                        {post.IsNFT ? 'Pin NFT' : 'Pin Post'}
                      </Menu.Item>
                    ))}

                  {currentUser &&
                    currentUser?.PublicKeyBase58Check === post.PosterPublicKeyBase58Check && (
                      <Menu.Item
                        color="red"
                        onClick={openHide}
                        leftSection={
                          <MdDeleteForever style={{ width: rem(16), height: rem(16) }} />
                        }
                      >
                        Hide
                      </Menu.Item>
                    )}
                </Menu.Dropdown>
              </Menu>
            </Group>
          </div>

          <Space h="sm" />
          <Group justify="center" style={{ display: 'flex', alignItems: 'center' }}>
            <HoverCard width={333} shadow="md" position="right">
              <HoverCard.Target>
                <UnstyledButton
                  component={Link}
                  href={`/wave/${username}`}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <Avatar
                    radius="xl"
                    size="lg"
                    src={
                      post.ProfileEntryResponse?.ExtraData?.LargeProfilePicURL ||
                      `https://node.deso.org/api/v0/get-single-profile-picture/${
                        post.ProfileEntryResponse?.PublicKeyBase58Check ||
                        post.PosterPublicKeyBase58Check
                      }` ||
                      null
                    }
                  />

                  <Space w="xs" />
                  <div>
                    <Box w={111}>
                      <Text fw={500} size="sm" truncate="end">
                        {post.ProfileEntryResponse?.ExtraData?.DisplayName || username}
                      </Text>
                    </Box>
                    <Text size="xs" truncate="end">
                      @{username}
                    </Text>
                  </div>
                </UnstyledButton>
              </HoverCard.Target>

              <HoverCard.Dropdown width={280} shadow="md">
                <Group justify="space-between">
                  <Avatar
                    radius="md"
                    size="xl"
                    src={
                      post.ProfileEntryResponse?.ExtraData?.LargeProfilePicURL ||
                      `https://node.deso.org/api/v0/get-single-profile-picture/${
                        post.ProfileEntryResponse?.PublicKeyBase58Check ||
                        post.PosterPublicKeyBase58Check
                      }` ||
                      null
                    }
                  />

                  {currentUser && currentUser.ProfileEntryResponse?.Username !== username ? (
                    <>
                      {isFollowingUser ? (
                        <Tooltip label={`Unfollow @${username}`} withArrow arrowPosition="center">
                          <ActionIcon variant="default" size={36} onClick={unfollowUser} mb={22}>
                            <RiUserUnfollowLine size="1.2rem" stroke={1.5} />
                          </ActionIcon>
                        </Tooltip>
                      ) : (
                        <Tooltip label={`Follow @${username}`} withArrow arrowPosition="center">
                          <ActionIcon variant="default" size={36} onClick={followUser} mb={22}>
                            <RiUserAddLine size="1.2rem" stroke={1.5} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </>
                  ) : null}
                </Group>
                <Space h="xs" />

                <Box w={255}>
                  <Text fw={500} truncate="end">
                    {post.ProfileEntryResponse?.ExtraData?.DisplayName || username}
                  </Text>
                </Box>
                <Text size="xs" truncate="end">
                  @{username}
                </Text>

                <Space h="xl" />

                <Text
                  fz="sm"
                  style={{
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'wrap',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: post?.ProfileEntryResponse?.Description
                      ? replaceURLs(post.ProfileEntryResponse?.Description).replace(/\n/g, '<br>')
                      : '',
                  }}
                />
                <Space h="sm" />
                <Group grow>
                  <SubscriptionModal
                    publickey={post.PosterPublicKeyBase58Check}
                    username={username}
                  />
                </Group>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group>
          <Space h="xl" />

          {post?.Body && (
            <>
              <Text
                ta="center"
                size="md"
                style={{
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                }}
                dangerouslySetInnerHTML={{
                  __html: post?.Body ? replaceURLs(post.Body).replace(/\n/g, '<br>') : '',
                }}
              />

              <Space h="md" />
            </>
          )}

          {post.PostExtraData?.EmbedVideoURL && (
            <>
              <Group justify="center">
                <iframe
                  title="extraembed-video"
                  id="embed-iframe"
                  className="w-full flex-shrink-0 feed-post__image"
                  height={getEmbedHeight(post.PostExtraData?.EmbedVideoURL)}
                  style={{ maxWidth: getEmbedWidth(post.PostExtraData?.EmbedVideoURL) }}
                  src={post.PostExtraData?.EmbedVideoURL}
                  frameBorder="0"
                  allow="picture-in-picture; clipboard-write; encrypted-media; gyroscope; accelerometer; encrypted-media;"
                  allowFullScreen
                  controls
                />
              </Group>

              <Space h="xs" />
            </>
          )}

          {isWavesStream ? (
            <Player
              controls
              showPipButton
              theme={{
                colors: {
                  loading: '#3cdfff',
                },
              }}
              playbackId={extractPlaybackId(post.VideoURLs[0])}
              title={post.PostExtraData?.WavesStreamTitle || `Video by ${username}`}
            />
          ) : (
            post.VideoURLs &&
            post.VideoURLs[0] && (
              <Player
                style={{ width: '100%', height: '100%' }}
                src={post.VideoURLs[0]}
                title={`Video by ${username}`}
                controls
                showPipButton
                theme={{
                  colors: {
                    loading: '#3cdfff',
                  },
                }}
              />
            )
          )}

          {post.ImageURLs && post.ImageURLs[0] && (
            <>
              <Group justify="center">
                <UnstyledButton
                  onClick={() => {
                    setSelectedImage(post.ImageURLs[0]);
                    openImage();
                  }}
                >
                  <Image src={post.ImageURLs[0]} radius="md" alt="post-image" fit="contain" />
                </UnstyledButton>
              </Group>
              <Space h="xs" />
            </>
          )}

          {post.PostExtraData?.PollOptions && (
            <>
              <Group p="xs" justify="space-between">
                <Tooltip label={`Weight Type: ${post.PostExtraData?.PollWeightType}`}>
                  <ActionIcon variant="default" size="xs" radius="xl">
                    <BsInfoCircleFill />
                  </ActionIcon>
                </Tooltip>
                {voteCount && (
                  <>
                    <Group ml={11}>
                      <Text size="sm" c="dimmed">
                        Total Votes: {voteCount.Total}{' '}
                      </Text>
                    </Group>
                  </>
                )}
              </Group>

              <Space h="xs" />

              {pollPostOptions.map((option, index) => (
                <>
                  <Group key={index} grow>
                    <Button
                      justify="space-between"
                      fullWidth
                      leftSection={<span />}
                      rightSection={
                        voteCount ? (
                          <>
                            <Group ml={11}>
                              <Text size="sm">{calculatePercentage(option)}%</Text>
                            </Group>
                          </>
                        ) : (
                          <span />
                        )
                      }
                      disabled={didVote}
                      onClick={() => {
                        submitVote(option);
                      }}
                      variant="light"
                      radius="xl"
                    >
                      {option}
                    </Button>
                  </Group>

                  <Space h="xs" />
                </>
              ))}
            </>
          )}

          {post.RepostedPostEntryResponse && (
            <Post
              post={post.RepostedPostEntryResponse}
              username={post.RepostedPostEntryResponse.ProfileEntryResponse.Username}
            />
          )}

          <Space h="md" />

          <Center>
            {isHearted || didHeartId ? (
              <Tooltip transition="slide-down" withArrow position="bottom" label="Unlike">
                <ActionIcon
                  onClick={() => deleteHeart()}
                  variant="subtle"
                  radius="md"
                  size={36}
                  ref={ref}
                >
                  {hovered ? <IconHeartBroken size={18} /> : <IconHeartFilled size={18} />}
                </ActionIcon>
              </Tooltip>
            ) : (
              <Tooltip transition="slide-down" withArrow position="bottom" label="Like">
                <ActionIcon onClick={() => submitHeart()} variant="subtle" radius="md" size={36}>
                  <IconHeart size={18} />
                </ActionIcon>
              </Tooltip>
            )}

            <Text size="xs" c="dimmed">
              {heartCount}
            </Text>

            <Space w="sm" />

            <Menu offset={2} shadow="md" width={111} withArrow>
              <Menu.Target>
                <Tooltip transition="slide-down" withArrow position="bottom" label="Repost">
                  <ActionIcon variant="subtle" radius="md" size={36}>
                    <IconRecycle size={18} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  onClick={() => submitRepost()}
                  leftSection={<IconRecycle style={{ width: rem(16), height: rem(16) }} />}
                >
                  Repost
                </Menu.Item>

                <Menu.Item
                  onClick={() => openQuote()}
                  leftSection={<BsChatQuoteFill style={{ width: rem(16), height: rem(16) }} />}
                >
                  Quote
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Text size="xs" c="dimmed">
              {repostCount}
            </Text>

            <Space w="sm" />

            <Tooltip transition="slide-down" withArrow position="bottom" label="Diamonds">
              <ActionIcon
                onClick={() => {
                  openDiamond();
                  getDiamondUSD();
                }}
                variant="subtle"
                radius="md"
                size={36}
              >
                <IconDiamond size={18} />
              </ActionIcon>
            </Tooltip>
            <Text size="xs" c="dimmed">
              {diamondCount}
            </Text>

            <Space w="sm" />

            <Tooltip transition="slide-down" withArrow position="bottom" label="Comments">
              <ActionIcon onClick={toggle} variant="subtle" radius="md" size={36}>
                <IconMessageCircle size={18} />
              </ActionIcon>
            </Tooltip>
            <Text size="xs" c="dimmed">
              {commentCount}
            </Text>
          </Center>
          <Collapse in={opened}>
            <>
              <Space h="md" />
              <Textarea
                placeholder="Enter your comment..."
                variant="filled"
                autosize
                value={comment}
                onChange={(event) => setComment(event.target.value)}
              />
              <Space h="sm" />
              {imageURL && (
                <div>
                  <ActionIcon
                    type="button"
                    onClick={() => {
                      setImageURL('');
                      setImageFile(null);
                      resetImageRef.current?.();
                    }}
                    size="xs"
                    color="red"
                  >
                    <IconX />
                  </ActionIcon>
                  <Image src={imageURL} alt="Uploaded" maw={240} mx="auto" radius="md" />
                </div>
              )}

              {embedUrl && (
                <>
                  <div>
                    <ActionIcon type="button" onClick={() => setEmbedUrl('')} size="xs" color="red">
                      <IconX />
                    </ActionIcon>
                  </div>

                  <iframe
                    title="extraembed-video"
                    id="embed-iframe"
                    className="w-full flex-shrink-0 feed-post__image"
                    height={getEmbedHeight(embedUrl)}
                    style={{ maxWidth: getEmbedWidth(embedUrl) }}
                    src={embedUrl}
                    frameBorder="0"
                    allow="picture-in-picture; clipboard-write; encrypted-media; gyroscope; accelerometer; encrypted-media;"
                    allowFullScreen
                  />

                  <Space h="xs" />
                </>
              )}

              {poll && (
                <>
                  <Space h="xs" />

                  <Container size="sm">
                    <Group justify="right">
                      <Tooltip label="Add Options">
                        <ActionIcon type="button" onClick={addPollOption} size="sm">
                          <CgPlayListAdd size="1.1rem" />
                        </ActionIcon>
                      </Tooltip>
                    </Group>

                    <Space h="md" />

                    {pollOptions &&
                      pollOptions?.map((option, index) => (
                        <div key={index}>
                          <TextInput
                            variant="filled"
                            placeholder={`Option ${index + 1}`}
                            radius="xl"
                            value={option}
                            onChange={(event) =>
                              handlePollOptions(index, event.currentTarget.value)
                            }
                            rightSection={
                              index > 1 && (
                                <ActionIcon
                                  radius="xl"
                                  size="sm"
                                  color="red"
                                  variant="light"
                                  type="button"
                                  onClick={() => deletePollOption(index)}
                                >
                                  <MdDeleteForever />
                                </ActionIcon>
                              )
                            }
                          />

                          <Space h="sm" />
                        </div>
                      ))}
                  </Container>
                  <Space h="xs" />
                </>
              )}

              {embed && (
                <>
                  <Space h="xs" />
                  <Box w={222}>
                    <TextInput
                      leftSection={
                        <>
                          <Tooltip
                            label={
                              <>
                                <Group justify="center">Supported</Group>

                                <Divider />

                                <List size="xs">
                                  <List.Item>Twitch</List.Item>
                                  <List.Item>Youtube</List.Item>
                                  <List.Item>Spotify</List.Item>
                                  <List.Item>Vimeo</List.Item>
                                  <List.Item>Giphy</List.Item>
                                  <List.Item>SoundCloud</List.Item>
                                  <List.Item>Mousai</List.Item>
                                  <List.Item>Request more in Global Chat!</List.Item>
                                </List>
                              </>
                            }
                            position="bottom"
                            withArrow
                          >
                            <ActionIcon type="button" size="xs" radius="xl" variant="default">
                              <TiInfoLargeOutline />
                            </ActionIcon>
                          </Tooltip>
                        </>
                      }
                      rightSection={
                        embedUrl && (
                          <ActionIcon
                            type="button"
                            onClick={() => setEmbedUrl('')}
                            color="red"
                            size="xs"
                            radius="xl"
                            variant="subtle"
                          >
                            <IconX />
                          </ActionIcon>
                        )
                      }
                      value={embedUrl}
                      onChange={handleEmbedLink}
                      variant="filled"
                      size="xs"
                      radius="xl"
                      placeholder="Add Link"
                    />
                  </Box>
                  <Space h="xs" />
                </>
              )}

              <Group ml={11} justify="apart">
                <Button
                  radius="md"
                  onClick={() => submitComment()}
                  loading={isLoadingPost}
                  disabled={
                    !comment.trim() ||
                    isLoadingPost ||
                    (poll && pollOptions.filter((option) => option.trim() !== '').length < 2)
                  }
                >
                  Comment
                </Button>

                <FileButton
                  onChange={setImageFile}
                  accept="image/png,image/jpeg,image/png,image.gif,image/webp"
                  resetRef={resetImageRef}
                  type="button"
                >
                  {(props) => (
                    <Tooltip label="Upload Image">
                      <ActionIcon
                        color="blue"
                        size="lg"
                        variant="default"
                        {...props}
                        loading={uploadInitiated}
                      >
                        <RiImageAddFill size="1.2rem" />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </FileButton>

                <Tooltip label="Add Poll">
                  <ActionIcon
                    color="blue"
                    size="lg"
                    variant="default"
                    onClick={pollToggle}
                    type="button"
                  >
                    <FaPoll size="1.2rem" />
                  </ActionIcon>
                </Tooltip>

                <Tooltip label="Embed">
                  <ActionIcon
                    color="blue"
                    size="lg"
                    variant="default"
                    onClick={embedToggle}
                    type="button"
                  >
                    <ImEmbed size="1.2rem" />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </>
          </Collapse>
          <Space h="sm" />
        </Paper>
      )}
    </>
  );
}
